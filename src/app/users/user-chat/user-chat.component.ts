import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {AngularFire} from 'angularfire2';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-user-chat',
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.scss']
})

export class UserChatComponent implements OnInit, OnChanges {


  @Input() uid;
  settings: any;
  messages: any;

  bots: any;
  users: any;

  displayName: any;

  asAdmin: boolean;
  @ViewChild('message') message;


  constructor(private af: AngularFire, private route: ActivatedRoute) {
    console.log(this.uid);
    this.bots = this.af.database.list(`/bots`);
    this.users = this.af.database.list(`/users`);

    this.displayName = this.af.auth.getAuth().auth.displayName;
    this.asAdmin = true;
  }

  ngOnInit(): void {
  }


  ngOndChanges() {
    console.log('onchange');
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    const uid: SimpleChange = changes['uid'];
    if (uid.currentValue !== null) {
      this.settings = this.af.database.object(`/user/${this.uid}/config/phases/social/settings`);
      this.settings.subscribe(snapshot => {
        this.messages = this.af.database.list(`/user/${snapshot.talkTo}/conversation`);
      });
    }

  }

  sendMessage(message) {
    console.log(message);
    this.messages.push({
      text: message.value,
      timestamp: moment().valueOf(),
      author: this.asAdmin ? this.uid : this.displayName,
    });
    this.message.nativeElement.value = '';
  }

  talkToParticipant(uid) {
    this.af.database.object(`/user/${this.uid}/config/phases/social/settings/talkTo`).set(uid);

    // set talkToBot
    this.af.database.object(`/user/${this.uid}/config/phases/social/settings/talkToBot`).set(false);

    // update bots
    this.af.database.list('/bots', {preserveSnapshot: true}).subscribe(snapshots => {
      snapshots.forEach(snapshot => {

        this.af.database.list(`/bots/${snapshot.key}/users`).remove(this.uid);


      });
    }).unsubscribe();
  }

  talkToBot(bid) {
    // set conversation to self
    this.af.database.object(`/user/${this.uid}/config/phases/social/settings/talkTo`).set(this.uid);

    // set talkToBot
    this.af.database.object(`/user/${this.uid}/config/phases/social/settings/talkToBot`).set(bid);

    // update bot

    this.af.database.list('/bots', {preserveSnapshot: true}).subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        if (bid === snapshot.key) {
          this.af.database.object(`/bots/${snapshot.key}/users/${this.uid}`).set(true);
        } else {
          this.af.database.list(`/bots/${snapshot.key}/users`).remove(this.uid);
        }

      });
    }).unsubscribe();

  }


}
