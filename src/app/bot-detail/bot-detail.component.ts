import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {AngularFire, FirebaseListObservable} from 'angularfire2';
import * as moment from 'moment';

@Component({
  selector: 'app-bot-detail',
  templateUrl: './bot-detail.component.html',
  styleUrls: ['./bot-detail.component.scss']
})
export class BotDetailComponent implements OnInit {
  af: any;
  bot: any;
  users: FirebaseListObservable<any[]>;
  conversations : FirebaseListObservable<any[]>;
  id: string;

  constructor(private route: ActivatedRoute, af: AngularFire) {
    this.af = af;

    this.route.params.subscribe(params => {
      this.id = params['id'];
      //this.conversations = this.af.database.list(`/users/${this.id}/config/conversation`);

      this.bot = this.af.database.object(`/bots/${this.id}/bot`);
      this.users = this.af.database.list(`/bots/${this.id}/users`);


    });
  }

  ngOnInit() {
  }

}
