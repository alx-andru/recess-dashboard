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

  id: number;
  private sub: any;
  isChatOpen: boolean;
  items: FirebaseListObservable<any[]>;
  af: any;
  settingsActive: boolean;
  users: any;
  user: any;
  conversationIds: FirebaseListObservable<any[]>;
  conversation: any;
  chattext: string;

  constructor(private route: ActivatedRoute, af: AngularFire) {
    this.af = af;
    this.users = af.database.list('/users');

  }


  ngOnInit() {
    this.isChatOpen = false;
    this.settingsActive = false;

    this.sub = this.route.params.subscribe(params => {
      this.id = params['id']; // (+) converts string 'id' to a number
      this.conversationIds = this.af.database.list(`/users/${this.id}/config/conversation`);

      this.user = this.af.database.object(`/users/${this.id}/user`);

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
          };
          this.af.database.object(`/users/${conversationUid}/user/alias`).subscribe(snapshot => {
            this.conversation.alias = snapshot.$value;
          });

          this.items = this.af.database.list(`/users/${this.conversation.uid}/conversation`);


        }

      });
    });
  }

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
      timestamp: 'teste',
    });
  };

  sendMessage = function () {
    this.items.push({
      text: '' + this.chattext,

      uid: this.conversation.uid,
      time: moment().toJSON(),
    });
  };

}
