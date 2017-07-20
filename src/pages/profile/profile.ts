import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";

import { PostPage } from "../post/post";
import { LoginPage } from "../login/login";
import { CategoriesPage } from "../categories/categories";
import { EditProfilePage } from "../edit-profile/edit-profile";

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
  host: string;
  token: string;
  auth: Object;
  user: Object;

  image_url: string = 'assets/img/avatar.png';

  posts: string = "myposts";
  
  city: string = '';
  country: string = '';
  previous_id: number;
  
  userFeed: Array<Object>;
  replyFeed: Array<Object>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http, private alertCtrl: AlertController, private storage: Storage, private loadingCtrl: LoadingController) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.auth = this.navParams.get('auth');
    this.user = this.navParams.get('user');

    this.previous_id = 0;

    this.userFeed = [];
    this.replyFeed = [];

    this.getUser();
  }

  getUser(){
    let loader = this.loader();

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user", {token:this.token,username:this.user['username']}, {headers: headers})
    .subscribe(data => {
      var json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.user = json.user;
        this.image_url = this.host + 'storage/' + json.user['image_url'];

        this.getFeedByUser(null);
        // this.getUserReplies(null);

        if (json.location.country.code != '000') {
          this.country = json.location.country.name;
        }
        if (json.location.city.id != 0) {
          this.city = json.location.city.name;
        }
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });

    loader.dismiss();
  }

  getFeedByUser(infiniteScroll){
    
    if (infiniteScroll == null) {
      this.userFeed = [];
      this.previous_id = 0;
    }
    
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.host + "/api/feed/user", {previous_id:this.previous_id,username:this.user['username'],token:this.token}, {headers: headers})
    .subscribe(data => {
    
      var json = JSON.parse(data['_body']);
      console.log(json);
    
      if (json.status == 1) {
        
        for(var iter1 in json.posts){
          this.userFeed.push(json.posts[iter1]);
          if (this.previous_id > json.posts[iter1].post_id || this.previous_id == 0) {
            this.previous_id = json.posts[iter1].post_id;
          }
        }
        
        if (infiniteScroll != null) { infiniteScroll.complete(); }

      } else { this.my_alert(json.error, json.description); }

    }, error => { this.my_alert('Error!', error); });

  }

  getUserReplies(infiniteScroll){

    if (infiniteScroll == null) {
      this.replyFeed = [];
      this.previous_id = 0;
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.host + "/api/feed/user/reply", {previous_id:this.previous_id,username:this.user['username'],token:this.token}, {headers: headers})
    .subscribe(data => {

      var json = JSON.parse(data['_body']);
      console.log(json);

      if (json.status == 1) {

        for(var iter1 in json.posts){
          this.replyFeed.push(json.posts[iter1]);
          if (this.previous_id > json.posts[iter1].post_id || this.previous_id == 0) {
            this.previous_id = json.posts[iter1].post_id;
          }
        }

        if (infiniteScroll != null) { infiniteScroll.complete(); }

      } else { this.my_alert(json.error, json.description); }

    }, error => { this.my_alert('Error!', error); });

  }

  goBack(){ this.navCtrl.pop(); }

  gotoPost(_post){ this.navCtrl.push(PostPage, {host: this.host, token: this.token, user: this.user, post: _post}); }

  gotoEditProfile(){ this.navCtrl.push(EditProfilePage, {host: this.host, token: this.token}); }

  gotoCategories(){ this.navCtrl.push(CategoriesPage, {host: this.host, token: this.token, user: this.auth}); }

  clickLogout(){
    this.token = "";
    this.user = {}

    // remove user info from the app storage
    this.storage.remove('token');
    this.storage.remove('user');

    this.navCtrl.setRoot(LoginPage);
  }

  loader(){
    let loader = this.loadingCtrl.create({ spinner:'crescent' });
    loader.present();
    return loader;
  }

  my_alert(_title: string, _subTitle: string){
    let alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

}
