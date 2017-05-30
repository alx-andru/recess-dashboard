import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title: string;
  newBot: any;

  constructor(private db: AngularFireDatabase) {
    this.title = 'Dashboard';
    this.newBot = this.db.object(`/bots/smarty`);

  }

  ngOnInit() {

  }

}
