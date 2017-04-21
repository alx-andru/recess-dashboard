import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';

import {DashboardComponent} from './dashboard/dashboard.component';
import {BotsComponent} from './bots/bots.component';
import {BotDetailsComponent} from './bots/bot-details/bot-details.component';

import {UsersComponent} from './users/users.component';
import {UserDetailsComponent} from './users/user-details/user-details.component';

import {ExportComponent} from './export/export.component';

import {AuthGuard} from './auth.guard';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],

    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'bots',
        component: BotsComponent,
        children: [
          {
            path: ':bid',
            component: BotDetailsComponent,
          }
        ]
      },
      {
        path: 'users',
        component: UsersComponent,
        children: [
          {
            path: ':uid',
            component: UserDetailsComponent,
          }
        ]
      },
      {
        path: 'export',
        component: ExportComponent,
      }

    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
