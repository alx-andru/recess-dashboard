import {ModuleWithProviders}  from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component'


import {AuthGuard} from './AuthGuard';

// Route Configuration
export const routes: Routes = [

  /*
   {
   path: '',
   component: HomeComponent,
   children: [
   {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
   {path: 'login', component: LoginComponent}
   ]
   },
   */

  {path: '', redirectTo: '/dashboard', pathMatch: 'full'},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent}

];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
