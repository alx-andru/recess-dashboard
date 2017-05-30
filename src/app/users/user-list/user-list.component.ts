import {Component, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {

  users: any = [];
  filteredUsers: any = [];
  today: moment.Moment = moment();

  constructor(public db: AngularFireDatabase) {
    const self = this;

    const items = this.db.list(`/users`, {
      preserveSnapshot: true,
      query: {
        orderByChild: 'deleted',
        equalTo: false,
      }
    });
    items.subscribe(snapshots => {
      /*
       self.users = [];
       snapshots.forEach(snapshot => {
       self.users.push(snapshot);
       });
       */
      self.users = snapshots;
      self.filteredUsers = snapshots;
    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    delete this.users;
  }

  search(filter) {

    const val = filter.filter;

    this.filteredUsers = this.users.filter(user => {
      const usr = user.val();

      let alias = -1;
      let device = -1;
      let manufacturer = -1;

      if (usr.alias) {
        alias = usr.alias.toLowerCase().indexOf(val.toLowerCase());

      }
      if (usr.device.model) {
        device = usr.device.model.toLowerCase().indexOf(val.toLowerCase());

      }
      if (usr.device.manufacturer) {
        manufacturer = usr.device.manufacturer.toLowerCase().indexOf(val.toLowerCase());

      }

      return (alias > -1 || device > -1 || manufacturer > -1);
    });
  }


}
