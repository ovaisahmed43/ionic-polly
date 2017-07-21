import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Http, Headers } from '@angular/http';

@Component({
  selector: 'page-picker',
  templateUrl: 'picker.html',
})
export class PickerPage {
  host: string;
  token: string;

  type: string;
  id: string;
  callback: any;

  param: Promise<Object>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private http: Http,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private transfer: FileTransfer,
    private file: File
  ) {}

  getAudios(){
    let root: any = this.file.externalRootDirectory;
    // let data: any = this.file.listDir(root, '/');
    this.file.resolveLocalFilesystemUrl(root).then((fileSystem) => {
      console.log(fileSystem);
    }).catch((error) => {});
    // console.log(data);
    //   function (fileSystem) {
    //     var reader = fileSystem.createReader();
    //     reader.readEntries(
    //       function (entries) {
    //         console.log(entries);
    //       },
    //       function (err) {
    //         console.log(err);
    //       }
    //     );
    //   }, function (err) {
    //     console.log(err);
    //   }
    // );
  }
  getVideos(){}

  upload(_opt_no: string, fileURL: string, _mimeType: string){
    let loader = this.loader();

    let fileTransfer: FileTransferObject = this.transfer.create();

    let options: FileUploadOptions = {
      fileKey: "file",
      // fileName: fileURL.substr(fileURL.lastIndexOf('/') + 1),
      httpMethod: 'POST',
      mimeType: _mimeType,
      chunkedMode: true
    }

    let params: Object = {
      type: this.type,
      token: this.token
    }
    options.params = params;

    // fileTransfer.onProgress((progressEvent: ProgressEvent) => {
    //   if (progressEvent.lengthComputable) {
    //     this.temp = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    //   }
    // });

    fileTransfer.upload(fileURL[0], encodeURI(this.host + "/api/upload"), options)
    .then((data) => {
      var json = JSON.parse(data['response']);
      console.log(json);
      if (json.status == 1) {
        this.callback(this.id, json);
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

  ionViewWillEnter() {
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.type = this.navParams.get('type');
    this.id = this.navParams.get('id');
    this.callback = this.navParams.get("callback")

    if (this.type == "audio") {
      this.getAudios();
    } else if (this.type == "video") {
      this.getVideos();
    }
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

  ionViewDidLoad() {
    console.log('ionViewDidLoad PickerPage');
  }

}
