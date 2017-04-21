import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from 'angularfire2';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-bot-details',
  templateUrl: './bot-details.component.html',
  styleUrls: ['./bot-details.component.scss']
})
export class BotDetailsComponent implements OnInit, OnDestroy {

  bot: any;
  users: any;

  sub;
  constructor(private af: AngularFire, private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe((params: { bid: string }) => {
      console.log(params.bid);
      if (params.bid !== 'none') {
        this.bot = this.af.database.object(`/bots/${params.bid}`);
        this.users = this.af.database.list(`/bots/${params.bid}/users`);
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
