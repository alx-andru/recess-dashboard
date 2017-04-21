import {Component, Input, OnInit} from '@angular/core';
import {AngularFire, AngularFireAuth} from'angularfire2';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})
export class BreadcrumbsComponent implements OnInit {
  user: any;

  @Input() title: string;

  constructor(private af: AngularFire) {
    this.af.auth.subscribe(user => {
      if (user) {
        // user logged in
        this.user = user;
      } else {
        // user not logged in
        this.user = {};
      }
    });
  }

  ngOnInit() {
  }

}


