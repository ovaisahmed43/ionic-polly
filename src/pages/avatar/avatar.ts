import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { ImagePicker } from '@ionic-native/image-picker';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { Http, Headers } from '@angular/http';
import { Storage } from "@ionic/storage";

@Component({
  selector: 'page-avatar',
  templateUrl: 'avatar.html',
})
export class AvatarPage {
  host: string;
  token: string;
  user: string;

  image_url: string = 'assets/img/avatar.png';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private http: Http,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private imagePicker: ImagePicker,
    private transfer: FileTransfer,
    private storage: Storage
  ) {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.user = this.navParams.get('user');
    this.image_url = this.user['image_url'];
  }

  changeAvatar() {
    this.uploadFile();
  }

  removeAvatar() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/avatar/r", { token: this.token }, { headers: headers })
      .subscribe(data => {

        var json = JSON.parse(data['_body']);
        console.log(json);

        if (json.status == 1) {
          this.user['image_url'] = json.image_url;
          this.image_url = json.image_url;
        } else {
          this.my_alert(json.error, json.description);
        }

      }, error => {
        this.my_alert('Error!', error);
      });
  }

  requestPermission(_count: number): boolean {
    console.log('req');
    if (_count > 0) {
      if (this.imagePicker.hasReadPermission()) {
        return true;
      }
      this.imagePicker.requestReadPermission();
      return this.requestPermission(_count--);
    }
    return false;
  }

  uploadFile() {
    if (!this.requestPermission(3)) {
      this.my_alert('Error!', 'No Read Permission.');
    } else {
      this.imagePicker.getPictures({
        maximumImagesCount: 1,
      }).then((result) => {
        this.upload(result);
      }, error => {
        this.my_alert('Error!', error);
      });
    }
  }

  upload(fileURL: string) {
    let loader = this.loader();

    let fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: "file",
      // fileName: fileURL.substr(fileURL.lastIndexOf('/') + 1),
      httpMethod: 'POST',
      mimeType: "image/*",
      chunkedMode: true
    }
    options.params = { token: this.token };

    fileTransfer.upload(fileURL[0], encodeURI(this.host + "/api/user/avatar"), options)
      .then((data) => {
        var json = JSON.parse(data['response']);
        console.log(json);
        if (json.status == 1) {
          this.user['image_url'] = json.image_url;
          this.image_url = json.image_url;
        } else {
          this.my_alert(json.error, json.description);
        }
        loader.dismiss();
      }, (error) => {
        this.my_alert('Error!', error);
        console.log(error);
        loader.dismiss();
      });
  }

  goBack() {
    this.navCtrl.pop();
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
    console.log('ionViewDidLoad AvatarPage');
  }

}
