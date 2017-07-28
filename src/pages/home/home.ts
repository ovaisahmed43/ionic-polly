import { Component } from '@angular/core';
import { Platform, IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";
import { BackgroundMode } from '@ionic-native/background-mode';

import { LoginPage } from "../login/login";
import { ProfilePage } from "../profile/profile";
import { PostPage } from "../post/post";
import { CreatePage } from "../create/create";

@IonicPage()

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})

export class HomePage {
  // host: string = "http://jamiamilliagce.edu.pk/owais/public/";
  // host: string = "http://192.168.0.107/fyp/public/";
  host: string = "http://localhost/fyp/public/";
  token: string;
  user: Object;

  profilePage = ProfilePage;
  last_kw_ids: string;
  feedData: Array<FeedData>;
  categories: Array<Object>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private http: Http,
    private alertCtrl: AlertController,
    private storage: Storage,
    private loadingCtrl: LoadingController,
    private backgroundMode: BackgroundMode
  ) {
    this.authenticate();
    this.backgroundMode.overrideBackButton();
    this.backgroundMode.excludeFromTaskList();
  }

  ionViewDidEnter() {
    if (this.token != null) {
      this.getMorePost(null);
    }
  }

  authenticate() {
    let loader = this.loaderWithText('Authenticating...');

    // User Model Validation
    this.storage.get('token').then((_token) => {
      if (_token == null || _token == undefined) {
        this.navCtrl.setRoot(LoginPage);
        loader.dismiss();
      } else {
        this.token = _token;
        loader.dismiss();

        this.getMorePost(null);
        this.getRecommendedCategories();
        this.getUser();
      }
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

  getUser() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user", { token: this.token }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          this.user = json.user;
        } else {
          this.my_alert(json.error, json.description);
          this.logout();
        }
      }, error => {
        this.my_alert('Error!', error);
      });
  }

  getMorePost(infiniteScroll) {
    let loader = null;

    if (infiniteScroll == null) {
      loader = this.loaderWithText('Fetching feed...');
      this.last_kw_ids = "0-0";
      this.feedData = [];
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    this.http.post(this.host + "/api/feed", { data: this.last_kw_ids, token: this.token }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {

          let pst = [];
          this.last_kw_ids = json.last_posts;

          for (var iter1 in json.posts) {
            for (var iter2 in json.posts[iter1].posts) {
              pst.push(json.posts[iter1].posts[iter2]);
            }
          }

          this.feedData.push({
            posts: pst,
            categories: this.categories
          });

          if (infiniteScroll != null) {
            infiniteScroll.complete();
            this.getRecommendedCategories();
          }

          if (loader != null) {
            loader.dismiss();
          }

        } else {
          this.my_alert(json.error, json.description);
          this.logout();

          if (loader != null) {
            loader.dismiss();
          }
        }
      }, error => {
        this.my_alert('Error!', error);

        if (loader != null) {
          loader.dismiss();
        }
      });

  }

  getRecommendedCategories() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/categories/recommend", { token: this.token }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          // console.log(json.categories.original.data);
          this.categories = json.categories.original.data;
        } else {
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });
  }

  gotoProfile() { this.navCtrl.push(ProfilePage, { host: this.host, token: this.token, auth: this.user, user: this.user }); }

  gotoPost(_post) { this.navCtrl.push(PostPage, { host: this.host, token: this.token, user: this.user, post: _post }); }

  gotoCreate(_type) { this.navCtrl.push(CreatePage, { host: this.host, token: this.token, user: this.user, type: _type }); }

  logout() {
    this.token = "";
    this.user = {}

    // remove user info from the app storage
    this.storage.remove('token');
    this.storage.remove('user');

    this.navCtrl.setRoot(LoginPage);
  }

  my_alert(_title: string, _subTitle: string) {
    let alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
  }

  loader() {
    let loader = this.loadingCtrl.create({ spinner: 'crescent' });
    loader.present();
    return loader;
  }

  loaderWithText(_text: string) {
    let loader = this.loadingCtrl.create({ spinner: 'crescent', content: _text });
    loader.present();
    return loader;
  }

}

export class FeedData {
  posts: Array<Object>;
  categories: Array<Object>;
  constructor(_posts: Array<Object>, _categories: Array<Object>) {
    this.posts = _posts;
    this.categories = _categories;
  }
}