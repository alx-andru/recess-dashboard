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

import { ChartModule } from 'angular2-highcharts';
import {MomentModule} from 'angular2-moment';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserChatComponent } from './user-chat/user-chat.component';

var firebaseConfig = require('./firebase.json');



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
