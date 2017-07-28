import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";
import { BackgroundMode } from '@ionic-native/background-mode';

import { RegisterPage } from "../register/register";
import { HomePage } from "../home/home";

@IonicPage()

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {
  // host: string = "http://jamiamilliagce.edu.pk/owais/public/";
  // host: string = "http://192.168.0.107/fyp/public/";
  host: string = "http://localhost/fyp/public/";

  registerPage = RegisterPage;
  user: FormGroup;

  loginBtnDisabled: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private http: Http,
    private alertCtrl: AlertController,
    private storage: Storage,
    private backgroundMode: BackgroundMode
  ) {

    // User Model Validation
    this.user = this.formBuilder.group({
      email: ['', Validators.compose([Validators.maxLength(255), Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  userLogin() {
    this.loginBtnDisabled = true;

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/login", JSON.stringify(this.user.value), { headers: headers })
      .subscribe(data => {
        console.log(data);
        var json = JSON.parse(data['_body']);
        console.log(json);

        if (json.status == 1) {
          this.storage.set('token', json.user.token);
          this.storage.set('user', json.user);

          this.backgroundMode.enable();

          this.navCtrl.setRoot(HomePage);
        } else {
          this.my_alert(json.error, json.description);
        }
        this.loginBtnDisabled = false;

      }, error => {
        this.loginBtnDisabled = false;
        this.my_alert('Error!', error);
      });
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