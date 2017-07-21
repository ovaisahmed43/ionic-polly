import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";

import { LoginPage } from "../login/login";

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {
  host: string;
  token: string;

  user: FormGroup;
  userLocation: FormGroup;
  userPassword: FormGroup;

  country :string;
  oldCountry :string;
  countrySelectOptions: Object = {};
  countries: Array<Object> = [];

  city: string;
  oldCity: string;
  citySelectOptions: Object = {};
  cities: Array<Object> = [];

  name_error: Array<string>;
  username_error: Array<string>;
  email_error: Array<string>;
  new_passowrd_error: Array<string>;
  old_passowrd_error: Array<string>;

  constructor(public navCtrl: NavController, public navParams: NavParams, private formBuilder: FormBuilder, private http: Http, public toastCtrl: ToastController, private alertCtrl: AlertController, private storage: Storage, private loadingCtrl: LoadingController) {
    // Set HostName of the URL
    this.host = this.navParams.get('host');
    
    // Set token
    this.token = this.navParams.get('token');
    
    // Setting SelectOption for Countries & Cities
    this.countrySelectOptions = {
      title: 'Select Country',
      subTitle: 'Please select a Country where you live in.'
    }
    this.citySelectOptions = {
      title: 'Select City',
      subTitle: 'Please select a City where you live in.'
    }
    this.getCountries();
    
    // Set Validations for User
    this.user = this.formBuilder.group({
      name: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(3), Validators.pattern('[a-zA-Z ]*'), Validators.required])],
      username: ['', Validators.compose([Validators.maxLength(50), Validators.minLength(3), Validators.pattern('[0-9a-zA-Z]*'), Validators.required])],
      email: ['', Validators.compose([Validators.maxLength(255), Validators.email, Validators.required])],
      token: ['', Validators.required]
    });
    this.getUser();

    // Set Validation for User Location
    this.userLocation = this.formBuilder.group({
      country_code: ['', Validators.compose([Validators.required])],
      city_id: ['', Validators.compose([Validators.required])],
      token: ['', Validators.required]
    });

    // Set Validation for User Password
    this.userPassword = this.formBuilder.group({
      old_password: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])],
      new_password: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])],
      cpassword: ['', Validators.compose([Validators.maxLength(255), Validators.minLength(6), Validators.required])],
      token: ['', Validators.required]
    });
  
  }

  ngAfterViewInit(){
    console.log('ngAfterViewInit');
  }

  getUser(){
    let loader = this.loader();

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user", {token:this.token}, {headers: headers})
    .subscribe(data => {
      let json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.user.setValue({
          name: json.user.name,
          username: json.user.username,
          email: json.user.email,
          token: this.token
        });

        this.oldCountry = this.country = json.user.country_code;
        this.oldCity = this.city = json.user.city_id;
        this.getCities();

        this.userLocation.setValue({
          country_code: json.user.country_code,
          city_id: json.user.city_id,
          token: this.token
        });

        this.userPassword.setValue({
          old_password: '',
          new_password: '',
          cpassword: '',
          token: this.token
        });

        this.storage.remove('user');
        this.storage.set('user', json.user);

      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });

    loader.dismiss();
  }

  userUpdate(){
    let loader = this.loader();

    this.emptyErrors();
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/update", JSON.stringify(this.user.value), {headers: headers})
    .subscribe(data => {
      let json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.user.setValue({
          name: json.user.name,
          username: json.user.username,
          email: json.user.email,
          token: this.token
        });

        this.showToast('Your Information has been Updated!');

      } else {

        for(let arr1 in json.data.name) {
          this.name_error.push(json.data.name[arr1]);
        }

        for(let arr2 in json.data.username) {
          this.username_error.push(json.data.username[arr2]);
        }

        for(let arr3 in json.data.email) {
          this.email_error.push(json.data.email[arr3]);
        }

        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });

    loader.dismiss();
  }

  userUpdateLocation(){
    let loader = this.loader();

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/location/update", JSON.stringify(this.userLocation.value), {headers: headers})
    .subscribe(data => {
      let json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.showToast('Your Location has been Updated!');
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });

    loader.dismiss();
  }

  userUpdatePassword(){
    let loader = this.loader();

    this.emptyErrors();
    if (this.userPassword.controls.new_password.valid == this.userPassword.controls.cpassword.valid) {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.host + "/api/user/password/update", JSON.stringify(this.userPassword.value), {headers: headers})
      .subscribe(data => {
        let json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          // this.my_alert('Success!','Your Password has been Updated!');
          this.showToast('Your Password has been Updated!');
        } else {
          for(let arr1 in json.data.old_password) {
            this.old_passowrd_error.push(json.data.old_password[arr1]);
          }
          for(let arr2 in json.data.new_password) {
            this.new_passowrd_error.push(json.data.new_password[arr2]);
          }
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });
    } else {
      this.my_alert('Password not matched!' ,'Password you entered do not match.');
    }

    loader.dismiss();
  }

  getCountries(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/countries", {}, {headers: headers})
    .subscribe(data => {
      let json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.countries = json.countries;
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });
  }

  getCities(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/cities", {code: this.country}, {headers: headers})
    .subscribe(data => {
      let json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.cities = json.cities;
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });
  }

  selectCountry(){
    if (this.oldCountry != this.country) {
      this.city = '';
    } else {
      this.city = this.oldCity;
    }
    this.getCities();
  }

  logout(){
    this.token = "";
    // this.user = {}

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

  showToast(_text: string) {
    let toast = this.toastCtrl.create({
      message: _text,
      duration: 2000,
      position: 'bottom'
    });
    toast.present(toast);
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
    this.new_passowrd_error = new Array<string>();
    this.old_passowrd_error = new Array<string>();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');
  }

}