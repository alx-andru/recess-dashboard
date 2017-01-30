import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFire, FirebaseListObservable} from 'angularfire2';
import * as moment from 'moment';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  get onSelectionChangeBot(): (bid) => any {
    return this._onSelectionChangeBot;
  }

  set onSelectionChangeBot(value: (bid) => any) {
    this._onSelectionChangeBot = value;
  }

  id: number;
  bid: string;
  private sub: any;
  isChatOpen: boolean;
  items: FirebaseListObservable<any[]>;
  af: any;
  settingsActive: boolean;
  users: FirebaseListObservable<any[]>;
  bots: FirebaseListObservable<any[]>;

  user: any;


  config: any;
  device: any;
  steps: any;
  selectedDays: any;
  conversationIds: FirebaseListObservable<any[]>;
  conversation: any;
  chattext: string;

  constructor(private route: ActivatedRoute, af: AngularFire) {
    this.af = af;
    this.users = af.database.list('/users');
    this.bots = af.database.list('/bots');

    this.isChatOpen = false;
    this.settingsActive = false;
    this.selectedDays = {};


  }


  ngOnInit() {
    this.initializeChatValues();

  }


  toggleChatActive = function (e) {
    this.config.set({
      chat: {
        isActive: e.target.checked
      }
    });
    this.initializeChatValues();
  };

  toggleChat = function () {
    this.isChatOpen = !this.isChatOpen;
  };

  activateSettings = function () {
    this.settingsActive = !this.settingsActive;
  };

  deactivateSettings = function () {
    this.settingsActive = false;
  };

  onSelectionChange = function (uid) {
    console.log(uid);
    this.conversationIds.push({
      uid: uid,
      type: 'participant',
      timestamp: moment().toJSON(),
    });

    //remove from bots
    let selectedbot = this.af.database.object(`/bots/${this.bid}/users/${this.id}`);
    selectedbot.remove();
  };

  private _onSelectionChangeBot = function (bid) {

    console.log('bid: ' + bid);
    this.bid = bid;

    this.conversationIds.push({
      uid: this.bid,
      type: 'bot',
      timestamp: moment().toJSON(),
    });

    // add userid to botlist

    let selectedBotUsers = this.af.database.object(`/bots/${this.bid}/users/${this.id}`);

    selectedBotUsers.set({
      timestamp: moment().toJSON(),
    })

  };

  sendMessage = function () {
    this.items.push({
      text: '' + this.chattext,

      uid: this.conversation.uid,
      time: moment().toJSON(),
    });
  };

  private initializeChatValues() {

    this.sub = this.route.params.subscribe(params => {
      this.id = params['id']; // (+) converts string 'id' to a number
      this.conversationIds = this.af.database.list(`/users/${this.id}/config/conversation`);

      this.user = this.af.database.object(`/users/${this.id}/user`);
      this.config = this.af.database.object(`/users/${this.id}/config`);
      this.device = this.af.database.object(`/users/${this.id}/device`);
      this.steps = this.af.database.object(`/users/${this.id}/steps`);

      this.af.database.list(`/users/${this.id}/config/conversation/`, {
        query: {
          limitToLast: 1,
        }
      }).subscribe(snapshots => {
        if (snapshots.length == 1) {
          let conversationUid = snapshots[0].uid;

          this.conversation = {
            uid: conversationUid,
            alias: '',
            type: snapshots[0].type,
          };


          this.af.database.object(`/users/${conversationUid}/user/alias`).subscribe(snapshot => {
            this.conversation.alias = snapshot.$value;
          });

          if (snapshots[0].type == 'bot') {

            // bot always listens to conversation in own channel
            this.items = this.af.database.list(`/users/${this.id}/conversation`);
            this.af.database.object(`/bots/${conversationUid}/bot/alias`).subscribe(snapshot => {
              this.conversation.alias = snapshot.$value;
            });
          } else {
            this.items = this.af.database.list(`/users/${this.conversation.uid}/conversation`);
          }


        }

      });

    });
  }

}
