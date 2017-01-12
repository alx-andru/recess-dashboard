import {Component, OnInit} from '@angular/core';
import {Routes} from '@angular/router';
import {AngularFire, AuthProviders} from 'angularfire2';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  user = {};

  constructor(public af: AngularFire) {
    this.af.auth.subscribe(user => {
      if (user) {
        // user logged in
        this.user = user;
      }
      else {
        // user not logged in
        this.user = {};
      }
    });
  }

  onNotify(message: string): void {
    console.log(message);

  }

  logout() {
    this.af.auth.logout();
  }

  ngOnInit() {
  }

}
