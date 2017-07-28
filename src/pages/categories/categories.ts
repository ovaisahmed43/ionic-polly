import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Http, Headers } from '@angular/http';

/**
 * Generated class for the CategoriesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html',
})
export class CategoriesPage {
  host: string;
  token: string;
  user: Object;

  categories: Array<Object>;
  followingIds: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private http: Http, private alertCtrl: AlertController) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.user = this.navParams.get('user');

    this.followingIds = [];
    this.categories = [];
    this.getFollowingCategories();
  }

  getCategories() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/categories/all", { token: this.token }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          this.categories = json.categories;
        } else {
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });
  }

  getFollowingCategories() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/categories", { token: this.token }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          this.followingIds = json.categories;
          this.getCategories();
        } else {
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });
  }

  manageCategory(_id: string) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/category/manage", { token: this.token, id: _id }, { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
        } else {
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CategoriesPage');
  }

  my_alert(_title: string, _subTitle: string) {
    let alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
  }
}
