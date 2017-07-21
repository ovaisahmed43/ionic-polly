import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

// Angular & Ionic Native Modules
import { HttpModule} from '@angular/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { IonicStorageModule } from '@ionic/storage';
import { FileTransfer } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

// Ionic CLoud API
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';

// Pages
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { RegisterPage } from '../pages/register/register';
import { HomePage } from '../pages/home/home';
import { ProfilePage } from '../pages/profile/profile';
import { EditProfilePage } from "../pages/edit-profile/edit-profile";
import { PostPage } from "../pages/post/post";
import { SlidesPage } from "../pages/slides/slides";
import { CreatePage } from "../pages/create/create";
import { CategoriesPage } from "../pages/categories/categories";
import { PickerPage } from "../pages/picker/picker";

// Custom Modules
// import { TagInputModule } from 'ng2-tag-input';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': '4e42c4f8'
  }
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    RegisterPage,
    HomePage,
    ProfilePage,
    EditProfilePage,
    PostPage,
    SlidesPage,
    CreatePage,
    CategoriesPage,
    PickerPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    RegisterPage,
    HomePage,
    ProfilePage,
    EditProfilePage,
    PostPage,
    SlidesPage,
    CreatePage,
    CategoriesPage,
    PickerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ImagePicker,
    FileTransfer,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}