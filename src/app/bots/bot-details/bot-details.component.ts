import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';

@Component({
  selector: 'app-bot-details',
  templateUrl: './bot-details.component.html',
  styleUrls: ['./bot-details.component.scss']
})
export class BotDetailsComponent implements OnInit, OnDestroy {

  bot: any;
  botRef: FirebaseObjectObservable<any>;
  // botConfigTemp: any;
  // botConfig: FirebaseObjectObservable<any>;
  users: FirebaseListObservable<any>;

  sub;
  @Output() isDetail = new EventEmitter();

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {

   // do nothing

  }

  ngOnInit() {
    this.sub = this.route.params.subscribe((params: { bid: string }) => {
      console.log(params.bid);
      if (params.bid !== 'none') {
        this.isDetail.emit(true);

        this.botRef = this.db.object(`/bots/${params.bid}`, {preserveSnapshot: true});
        this.users = this.db.list(`/bots/${params.bid}/users`);
        this.botRef.subscribe(snapshot => {
          this.bot = snapshot.val();

        });

      }
    });


  }

  updateConfig() {
    this.botRef.set(this.bot);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }


}
