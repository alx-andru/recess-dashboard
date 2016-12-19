import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';
import * as moment from 'moment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: FirebaseListObservable<any[]>;

  selectedDays: any;

  constructor(af: AngularFire) {
    this.users = af.database.list('/users');
    this.selectedDays = {};
  }

  ngOnInit() {
    for (let user in this.users) {
      //this.selectedDays[this.users[user].uid] = moment();
    }

  }

  daySelected(day) {
    console.log(day);
    //this.day = moment(day);
    this.selectedDays[day.userid] = day.date;
  }

}
