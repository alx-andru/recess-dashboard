import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable} from 'angularfire2';

@Component({
  selector: 'app-bot-list',
  templateUrl: './bot-list.component.html',
  styleUrls: ['./bot-list.component.scss']
})
export class BotListComponent implements OnInit, OnDestroy {

  bots: any = [];

  constructor(public af: AngularFire) {
    const self = this;

    const items = this.af.database.list(`/bots`, {preserveSnapshot: true});
    items.subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        //console.log(snapshot);
        self.bots.push(snapshot);
      });


    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    delete this.bots;
  }

}
