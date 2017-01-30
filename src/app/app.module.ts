import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MDL} from './MaterialDesignLiteUpgradeElement';
import {AngularFireModule, AuthMethods, AuthProviders} from 'angularfire2';

import {routing} from './app.routes';

import {AppComponent} from './app.component';
import {UserListComponent} from './user-list/user-list.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';

import {AuthGuard} from './AuthGuard';
import {HomeComponent} from './home/home.component';
import {UserStepsComponent} from './user-steps/user-steps.component'

//import {ChartistModule} from 'angular2-chartist';
import {UserStepsWeekComponent} from './user-steps-week/user-steps-week.component';

import {ChartModule} from 'angular2-highcharts';
import {MomentModule} from 'angular2-moment';
import {UserDetailComponent} from './user-detail/user-detail.component';
import {BotDetailComponent} from './bot-detail/bot-detail.component';
import {UserChatComponent} from './user-chat/user-chat.component';

const firebaseConfig = {
  "apiKey": "AIzaSyAHfTGyRQgRgeumLCvn2zlez5cL_tfKz2k",
  "authDomain": "recess-app-008.firebaseapp.com",
  "databaseURL": "https://recess-app-008.firebaseio.com",
  "storageBucket": "recess-app-008.appspot.com",
  "messagingSenderId": "105024553958"
};


@NgModule({
  declarations: [
    AppComponent,
    MDL,
    UserListComponent,
    LoginComponent,
    DashboardComponent,
    HomeComponent,
    UserStepsComponent,
    UserStepsWeekComponent,
    UserDetailComponent,
    UserChatComponent,
    BotDetailComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    //ChartistModule,
    ChartModule,
    MomentModule,
    AngularFireModule.initializeApp(firebaseConfig, {
      provider: AuthProviders.Google,
      method: AuthMethods.Redirect
    })],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {
}
