import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';

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

  constructor(public afAuth: AngularFireAuth, private router: Router) {
    this.page = 'login';
    this.afAuth.auth.onAuthStateChanged( (user) => {
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
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());

  }

  logout() {
    this.afAuth.auth.signOut();
  }

}
