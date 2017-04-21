import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AngularFire, AuthProviders} from 'angularfire2';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})


export class LoginComponent implements OnInit {

  user = {};
  page = 'login';

  @Output() notify: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.notify.emit({
      value: 'login'
    });
    console.log('Login init');
  }

  constructor(public af: AngularFire, private router: Router) {
    this.page = 'login';
    this.af.auth.subscribe(user => {
      if (user) {
        // user logged in
        this.user = user;
        this.router.navigate(['/dashboard']);
      } else {
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
