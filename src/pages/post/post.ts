import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";

import { LoginPage } from "../login/login";
import { SlidesPage } from "../slides/slides";
import { ProfilePage } from "../profile/profile";

@IonicPage()
@Component({
  selector: 'page-post',
  templateUrl: 'post.html',
})
export class PostPage {
  host: string;
  token: string;
  user: Object;
  auth: Object;

  newComment: FormGroup;

  post: Object;
  username: string;
  comments: Array<Object>;

  replied: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private http: Http, private alertCtrl: AlertController, private storage: Storage, private loadingCtrl: LoadingController) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.auth = this.navParams.get('user');

    this.post = this.navParams.get('post');
    this.getComments();

    console.log(this.post);

    this.newComment = this.formBuilder.group({
      comment: ['', Validators.compose([Validators.minLength(1), Validators.required])],
      post_id: this.post['post_id'],
      token: this.token
    });

    this.username = this.post['username'];
    this.getUser();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PostPage');
  }

  getComments(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/comments", {post_id:this.post['post_id'],token:this.token}, {headers: headers})
    .subscribe(data => {
      var json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.comments = json.comments;
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });
  }

  doComment(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/comment", JSON.stringify(this.newComment.value), {headers: headers})
    .subscribe(data => {
      var json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.newComment.controls.comment.setValue('');
        this.comments = json.comments;
        this.getComments();
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });
  }

  getUser(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user", { token:this.token,username:this.username }, { headers: headers })
    .subscribe(data => {

      var json = JSON.parse(data['_body']);
      console.log(json);

      if (json.status == 1) { this.user = json.user; }
      else {
        this.my_alert(json.error, json.description);
        this.logout();
      }

    }, error => { this.my_alert('Error!', error); });
  }

  doVote(_post_id: string, _option_no: string){
    let loader = this.loader();
    this.replied = true;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/post/vote", { token:this.token, post_id:_post_id, option_no:_option_no }, { headers: headers })
    .subscribe(data => {

      var json = JSON.parse(data['_body']);
      console.log(json);

      if (json.status == 1) {
        console.log(json.replies);
        for (var index = 0; index < json.replies.length; index++) {
          this.post['post_options'][index]['total'] = json.replies[index]['total'];
        }
      }
      else {
        this.my_alert(json.error, json.description);
      }

      loader.dismiss();

    }, error => { this.my_alert('Error!', error); });

    loader.dismissAll();
  }

  gotoSlides(_options){ this.navCtrl.push(SlidesPage, { host:this.host, token:this.token, options:_options, type:this.post['post_type'] }); }

  gotoProfile(_username){ this.navCtrl.push(ProfilePage, { host:this.host, token:this.token, auth:this.auth, user:this.user }); }

  logout(){
    this.token = "";
    this.auth = {};
    this.user = {};

    // remove user info from the app storage
    this.storage.remove('token');
    this.storage.remove('user');

    this.navCtrl.setRoot(LoginPage);
  }

  my_alert(_title: string, _subTitle: string){
    let alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
  }

  loader(){
    let loader = this.loadingCtrl.create({ spinner:'crescent' });
    loader.present();
    return loader;
  }

}
