import {Component, Input, OnInit} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  user: Observable<firebase.User>;

  @Input() title: string;

  constructor(private afAuth: AngularFireAuth) {

    this.user = afAuth.authState;
  }

  ngOnInit() {
  }

  signOut() {
    this.afAuth.auth.signOut();
  }

}


