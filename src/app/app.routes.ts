import {ModuleWithProviders}  from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {LoginComponent} from './login/login.component';
import {UserDetailComponent} from './user-detail/user-detail.component';


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
  {
    path: '',
    redirectTo: '/dashboard',
    //component: HomeComponent,
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {path: 'user/:id', component: UserDetailComponent},
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },


];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
