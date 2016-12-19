import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AngularFire, AuthProviders} from 'angularfire2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {
  @Output() notify: EventEmitter<any> = new EventEmitter();


  ngOnInit() {
    this.notify.emit({
      value: 'login'
    });
    console.log('Login init');
  }

  user = {};
  page = 'login';

  constructor(public af: AngularFire) {
    this.page = 'login';
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

  login() {
    this.af.auth.login({
      provider: AuthProviders.Google
    });
  }

  logout() {
    this.af.auth.logout();
  }

}
