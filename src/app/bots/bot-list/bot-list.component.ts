import {Component, OnDestroy, OnInit} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
  selector: 'app-bot-list',
  templateUrl: './bot-list.component.html',
  styleUrls: ['./bot-list.component.scss']
})
export class BotListComponent implements OnInit, OnDestroy {

  bots: any = [];
  filteredBots: any = [];

  constructor(public db: AngularFireDatabase) {
    const self = this;

    const items = this.db.list(`/bots`, {preserveSnapshot: true});
    items.subscribe(snapshots => {
      self.filteredBots = [];
      snapshots.forEach(snapshot => {
        self.bots.push(snapshot);
        self.filteredBots.push(snapshot);
      });


    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    delete this.bots;
  }

  search(filter) {

    const val = filter.filter;

    this.filteredBots = this.bots.filter(botRef => {
      const bot = botRef.val();

      console.log(bot);
      let alias = -1;

      if (bot.alias) {
        alias = bot.alias.toLowerCase().indexOf(val.toLowerCase());

      }


      return (alias > -1 );
    });
  }

}
