import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy, OnChanges {

  user: any;
  sub: any;

  survey: any;
  today: any = moment();
  config: any;

  usersteps: FirebaseListObservable<any>;
  distance: any;

  isConversation: boolean;

  uid: any;

  constructor(private db: AngularFireDatabase, private route: ActivatedRoute) {
    this.isConversation = true;
  }

  ngOndChanges() {
    console.log('onchange');
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe((params: { uid: string }) => {
      if (params.uid !== 'none' && params.uid !== this.uid) {
        this.uid = params.uid;
        this.user = this.db.object(`/users/${this.uid}`);
        this.config = this.db.object(`/user/${this.uid}/config`);
        this.survey = this.db.object(`/user/${this.uid}/survey`);

        this.usersteps = this.db.list(`/user/${this.uid}/data/ui/user/steps`);

      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('onchange');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
