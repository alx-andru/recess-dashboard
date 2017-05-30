import {Component} from '@angular/core';
import {Router} from '@angular/router';

import {AngularFireAuth} from 'angularfire2/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],

})
export class AppComponent {

  constructor(private auth: AngularFireAuth, private router: Router) {

  }

  onNotify(message: any): void {
    console.log('message: ' + message);

  }
}
