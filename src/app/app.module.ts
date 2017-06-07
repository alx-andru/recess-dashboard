import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routes';

import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';

import {AuthGuard} from './auth.guard';


import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';

import {DashboardComponent} from './dashboard/dashboard.component';
import {NavigationComponent} from './home/navigation/navigation.component';
import {BreadcrumbsComponent} from './ui/breadcrumbs/breadcrumbs.component';

import {BotsComponent} from './bots/bots.component';
import {BotListComponent} from './bots/bot-list/bot-list.component';
import {BotDetailsComponent} from './bots/bot-details/bot-details.component';

import {UsersComponent} from './users/users.component';
import {UserListComponent} from './users/user-list/user-list.component';
import {UserDetailsComponent} from './users/user-details/user-details.component';
import {UserChatComponent} from './users/user-chat/user-chat.component';


import {MomentModule} from 'angular2-moment';
import {AliasPipe} from './pipes/alias.pipe';
import {ExportComponent} from './export/export.component';
import {ButtonComponent} from './ui/button/button.component';
import {environment} from '../environments/environment';
import {BotMessagesComponent} from './bots/bot-messages/bot-messages.component';

import {FilterComponent} from './ui/filter/filter.component';
import {StepsComponent} from './ui/charts/steps/steps.component';
import { MapToIterablePipe } from './pipes/map-to-iterable.pipe';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    NavigationComponent,
    HomeComponent,
    BreadcrumbsComponent,

    UsersComponent,
    UserListComponent,
    UserDetailsComponent,

    BotsComponent,
    BotListComponent,
    BotDetailsComponent,
    UserChatComponent,
    AliasPipe,
    ExportComponent,
    ButtonComponent,
    BotMessagesComponent,
    FilterComponent,
    StepsComponent,
    MapToIterablePipe

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    MomentModule,
    BrowserAnimationsModule,
    routing,


  ],
  providers: [
    AuthGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
