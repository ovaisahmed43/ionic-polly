import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';

@IonicPage()
@Component({
  selector: 'page-slides',
  templateUrl: 'slides.html',
})
export class SlidesPage {
  host: string;
  token: string;
  type: string;
  options: Object;

  replied: boolean = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private http: Http, private alertCtrl: AlertController, private loadingCtrl: LoadingController) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.type = this.navParams.get('type');
    this.options = this.navParams.get('options');
  }

  doVote(_post_id: string, _option_no: string) {
    let loader = this.loader();
    this.replied = true;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/post/vote", { token: this.token, post_id: _post_id, option_no: _option_no }, { headers: headers })
      .subscribe(data => {

        var json = JSON.parse(data['_body']);
        console.log(json);

        if (json.status == 1) {
          console.log(json.replies);
          for (var index = 0; index < json.replies.length; index++) {
            // this.post['post_options'][index]['total'] = json.replies[index]['total'];
          }
        }
        else {
          this.my_alert(json.error, json.description);
        }

        loader.dismiss();

      }, error => { this.my_alert('Error!', error); });

    loader.dismissAll();
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlidesPage');
  }

  slideChanged() {
    // i want stop audio / video when slide is swiped
  }

}