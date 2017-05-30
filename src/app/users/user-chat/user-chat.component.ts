import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';

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
  showDelete = false;

  @ViewChild('message') message;


  constructor(private db: AngularFireDatabase, private af: AngularFireAuth, private router: Router) {
    this.bots = this.db.list(`/bots`);
    this.users = this.db.list(`/users`);

    this.displayName = this.af.auth.currentUser.displayName;
    this.asAdmin = true;
  }

  ngOnInit(): void {
  }


  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    const uid: SimpleChange = changes['uid'];
    if (uid.currentValue !== null) {
      this.settings = this.db.object(`/user/${this.uid}/config/phases/social/settings`);
      this.settings.subscribe(snapshot => {
        this.messages = this.db.list(`/user/${snapshot.talkTo}/conversation`);
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
    this.db.object(`/user/${this.uid}/config/phases/social/settings/talkTo`).set(uid);

    // set talkToBot
    this.db.object(`/user/${this.uid}/config/phases/social/settings/talkToBot`).set(false);

    // update bots
    this.db.list('/bots', {preserveSnapshot: true}).subscribe(snapshots => {
      snapshots.forEach(snapshot => {

        this.db.list(`/bots/${snapshot.key}/users`).remove(this.uid);


      });
    }).unsubscribe();
  }

  enableDelete() {
    this.showDelete = true;
  }

  markAsDelete() {
    this.db.object(`/users/${this.uid}/deleted`).set(true);
    this.router.navigate(['/users']);
  }

  talkToBot(bid) {
    // set conversation to self
    this.db.object(`/user/${this.uid}/config/phases/social/settings/talkTo`).set(this.uid);

    // set talkToBot
    this.db.object(`/user/${this.uid}/config/phases/social/settings/talkToBot`).set(bid);

    // update bot

    this.db.list('/bots', {preserveSnapshot: true}).subscribe(snapshots => {
      snapshots.forEach(snapshot => {
        if (bid === snapshot.key) {
          this.db.object(`/bots/${snapshot.key}/users/${this.uid}`).set(true);
        } else {
          this.db.list(`/bots/${snapshot.key}/users`).remove(this.uid);
        }

      });
    }).unsubscribe();

  }


}
