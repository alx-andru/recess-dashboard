import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFire} from 'angularfire2';
import * as moment from 'moment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: any = [];
  today: moment.Moment = moment();

  constructor(public af: AngularFire) {
    const self = this;

    const items = this.af.database.list(`/users`, {preserveSnapshot: true});
    items.subscribe(snapshots => {
      /*
       self.users = [];
       snapshots.forEach(snapshot => {
       self.users.push(snapshot);
       });
       */
      self.users = snapshots;

    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    delete this.users;
  }


}
