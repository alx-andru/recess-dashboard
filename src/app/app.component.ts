import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {FirebaseAuth,} from 'angularfire2';


@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  host: {'[class.login]': 'isLogin'},

})
export class AppComponent {

  public page: string = 'test page';
  public isLogin: boolean = false;

  constructor(private auth: FirebaseAuth, private router: Router) {
    this.auth.subscribe(user => {
      if (user) {
        // go to home page
        console.log(user);
        this.router.navigate(['dashboard']); //use the stored url here
      } else {
        // go to login page
        console.log('logout');
      }
    });
  }

  onNotify(message: any): void {
    console.log('message: ' + message);
    this.isLogin = true;


  }
}
