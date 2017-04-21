import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFire} from 'angularfire2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  title: string;
  newBot: any;

  constructor(private af: AngularFire) {
    this.title = 'Dashboard';
    this.newBot = this.af.database.object(`/bots/smarty`);

  }

  ngOnInit() {

  }

}
