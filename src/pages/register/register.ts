import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { AlertController } from 'ionic-angular';
import { Storage } from "@ionic/storage";

import { LoginPage } from "../login/login";
import { HomePage } from "../home/home";

/**
 * Generated class for the RegisterPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  host:string = "http://jamiamilliagce.edu.pk/owais/public/";
  // host:string = "http://localhost/fyp/public/";
  host_local:string = "http://localhost/fyp/public/";
  loginPage = LoginPage;
  user: FormGroup;

  name_error: Array<string>;
  username_error: Array<string>;
  email_error: Array<string>;
  password_error: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private http: Http, private alertCtrl: AlertController, private storage: Storage, private loadingCtrl: LoadingController) {

    // Set Validations for User
    this.user = this.formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(3), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      username: ['', Validators.compose([Validators.maxLength(50), Validators.minLength(3), Validators.pattern('[0-9a-zA-Z]*'), Validators.required])],
      email: ['', Validators.compose([Validators.maxLength(255), Validators.email, Validators.required])],
      password: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])],
      cpassword: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])]
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  userRegister(){
    this.emptyErrors();
    if (this.user.controls.password.value == this.user.controls.cpassword.value) {
      let loader = this.loader();

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.host + "/api/register", JSON.stringify(this.user.value), { headers: headers })
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        if (json.status == 1) {
          this.storage.set('token', json.user.token);
          this.storage.set('user', json.user);
          this.my_alert('Success!', 'Please verify you email address in order enjoy the features of Polly!');
          this.navCtrl.setRoot(HomePage);
        } else {

          for(var arr1 in json.data.name) {
            this.name_error.push(json.data.name[arr1]);
          }

          for(var arr2 in json.data.username) {
            this.username_error.push(json.data.username[arr2]);
          }

          for(var arr3 in json.data.email) {
            this.email_error.push(json.data.email[arr3]);
          }

          for(var arr4 in json.data.password) {
            this.password_error.push(json.data.password[arr4]);
          }

          this.my_alert(json.error, json.description);

        }
        loader.dismiss();
      },
      error => {
        console.log(error);
        this.my_alert('Error!', error);
      });
      loader.dismiss();
    } else {
      this.my_alert('Password not matched!' ,'Password you entered do not match.');
    }
  }

  goBack(){
    this.navCtrl.pop();
  }

  my_alert(_title: string, _subTitle: string){
    let alert = this.alertCtrl.create({
      title: _title,
      subTitle: _subTitle,
      buttons: ['OK']
    });
    alert.present();
  }

  emptyErrors(){
    this.name_error = new Array<string>();
    this.username_error = new Array<string>();
    this.email_error = new Array<string>();
    this.password_error = new Array<string>();
  }

  loader(){
    let loader = this.loadingCtrl.create({ spinner:'crescent' });
    loader.present();
    return loader;
  }

}
