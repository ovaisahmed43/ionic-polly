import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import { ImagePicker } from '@ionic-native/image-picker';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';

import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Http, Headers } from '@angular/http';

@IonicPage()
@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage {
  host: string;
  token: string;
  user: Object;
  type: string;

  post: FormGroup;
  all_keywords: Array<Object>;

  temp: number;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private http: Http,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private imagePicker: ImagePicker,
    private transfer: FileTransfer
  ) {

    // Parameters
    this.host = this.navParams.get('host');
    this.token = this.navParams.get('token');
    this.user = this.navParams.get('user');
    this.type = this.navParams.get('type');

    // Initializing of Post
    this.post = this.formBuilder.group({
      token: [this.token, Validators.compose([Validators.required])],
      ques: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(255)])],
      type: [this.type, Validators.compose([Validators.required])],
      count: [0, Validators.compose([Validators.required])],
      options: this.formBuilder.array([]),
      keywords: [[], Validators.compose([Validators.required, Validators.minLength(1)])]
    });

    // Adding 2 option at start
    for (var index = 0; index < 2; index++) { this.addOption(); }
    this.getKeywords();
  }

  checkValidity(){
    let p = this.post.controls;
    console.log('token => ' + p.token.valid + ' | ' + p.token.value);
    console.log('ques => ' + p.ques.valid + ' | ' + p.ques.value);
    console.log('type => ' + p.type.valid + ' | ' + p.type.value);
    console.log('count => ' + p.count.valid + ' | ' + p.count.value);
    console.log('options => ' + p.options.valid + ' | ' + p.options.value);
    console.log('keywords => ' + p.keywords.valid + ' | ' + p.keywords.value);
  }

  get options(): FormArray {
    return this.post.get('options') as FormArray;
  }

  addOption() {
    // console.log('addOption Triggered!');

    if (this.post.controls.count.value < 4) {

      if (this.post.controls.type.value == 'text') {
        this.options.push(this.formBuilder.group({
          option_no: [this.post.controls.count.value, Validators.compose([Validators.required])],
          text: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
        }));
        console.log('addOption => text');
      }
      else if (this.post.controls.type.value == 'image') {
        this.options.push(this.formBuilder.group({
          option_no: [this.post.controls.count.value, Validators.compose([Validators.required])],
          caption: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
          file_id: ['', Validators.compose([Validators.required])],
          file_path: ['', Validators.compose([Validators.required])]
        }));
        console.log('addOption => image');
      }
      else if (this.post.controls.type.value == 'audio') {
        this.options.push(this.formBuilder.group({
          option_no: [this.post.controls.count.value, Validators.compose([Validators.required])],
          caption: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
          file_id: ['', Validators.compose([Validators.required])],
          file_path: ['', Validators.compose([Validators.required])]
        }));
        console.log('addOption => audio');
      }
      else if (this.post.controls.type.value == 'video') {
        this.options.push(this.formBuilder.group({
          option_no: [this.post.controls.count.value, Validators.compose([Validators.required])],
          caption: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
          file_id: ['', Validators.compose([Validators.required])],
          file_path: ['', Validators.compose([Validators.required])]
        }));
        console.log('addOption => video');
      }
      else {
        this.post.controls.count.setValue(this.post.controls.count.value - 1);
        this.my_alert('Error!','There is an error in Post Type.');
      }

      this.post.controls.count.setValue(this.post.controls.count.value + 1);

    }
  }

  postPoll(){
    this.checkValidity();

    if (this.post.valid) {
      let loader = this.loader();

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.host + "/api/post", JSON.stringify(this.post.value), {headers: headers})
      .subscribe(data => {
        var json = JSON.parse(data['_body']);
        console.log(json);
        if (json.status == 1) {
          // this.showToast('Your Location has been Updated!');
        } else {
          this.my_alert(json.error, json.description);
        }
      }, error => {
        this.my_alert('Error!', error);
      });

      loader.dismiss();
    }
  }

  requestPermission(_count: number): boolean {
    console.log('req');
    if (_count < 3) {
      if (this.imagePicker.hasReadPermission()) {
        return true;
      }
      this.imagePicker.requestReadPermission();
      return this.requestPermission(_count++);
    }
    return false;
  }

  uploadFile(_id: string){
    if (this.post.controls.type.value == 'image') {
      if (!this.requestPermission(0)) {
        this.my_alert('Error!', 'No Read Permission.');
      } else {
        this.imagePicker.getPictures({
          maximumImagesCount: 1,
        }).then((result) => {
          this.upload(_id, result, "image/*");
        }, error => {
          this.my_alert('Error!', error);
        });
      }
    }
    else if (this.post.controls.type.value == 'audio') {}
    else if (this.post.controls.type.value == 'video') {}
    else {
      this.my_alert('Error!','There is an error in Post Type.');
    }
  }

  upload(_opt_no: string, fileURL: string, _mimeType: string){
    this.temp = 0;
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
      type: this.post.controls.type.value,
      token: this.token
    }
    options.params = params;

    fileTransfer.onProgress((progressEvent: ProgressEvent) => {
      if (progressEvent.lengthComputable) {
        this.temp = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      }
    });

    fileTransfer.upload(fileURL[0], encodeURI(this.host + "/api/upload"), options)
    .then((data) => {
      var json = JSON.parse(data['response']);
      console.log(json);
      if (json.status == 1) {
        this.options.controls[_opt_no].controls.file_id.setValue(json.file_id);
        this.options.controls[_opt_no].controls.file_path.setValue(json.file_url);
        this.temp = 0;
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

  getKeywords(){
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    this.http.post(this.host + "/api/user/keywords", {token:this.token}, {headers: headers})
    .subscribe(data => {
      var json = JSON.parse(data['_body']);
      console.log(json);
      if (json.status == 1) {
        this.all_keywords = json.keywords;
      } else {
        this.my_alert(json.error, json.description);
      }
    }, error => {
      this.my_alert('Error!', error);
    });
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
    console.log('ionViewDidLoad CreatePage');
  }

  test() {
    this.checkValidity();
    console.log(this.post);
  }

}

export class Post {
  token: string;
  ques: string;
  type: string;
  count: number;
  options: Array<Option>;
  keywords: Array<Keyword>;

  constructor(){}
}

export class Option {
  option_no: number;
}
export class TextOption extends Option {
  text: string = '';
}
export class ImageOption extends Option {
  caption: string = '';
  file_id: number = 0;
  file_path: string = '';
}
export class AudioOption extends Option {
  caption: string = '';
  file_id: number = 0;
  file_path: string = '';
}
export class VideoOption extends Option {
  caption: string = '';
  file_id: number = 0;
  file_path: string = '';
}

export class Keyword {
  id: number;
}