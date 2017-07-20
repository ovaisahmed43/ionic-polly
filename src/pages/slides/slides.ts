import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the SlidesPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.type = this.navParams.get('type');
    this.options = this.navParams.get('options');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SlidesPage');
  }

  slideChanged() {
    // i want stop audio / video when slide is swiped
  }

}
