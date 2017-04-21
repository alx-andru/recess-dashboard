import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AngularFire} from 'angularfire2';
import * as moment from 'moment';

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

  steps: any;
  distance: any;

  isConversation: boolean;

  uid:any;

  constructor(private af: AngularFire, private route: ActivatedRoute) {
    this.isConversation = true;
  }

  ngOndChanges() {
    console.log('onchange');
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe((params: { uid: string }) => {
      if (params.uid !== 'none' && params.uid !== this.uid) {
        this.uid = params.uid;
        this.user = this.af.database.object(`/users/${this.uid}`);
        this.config = this.af.database.object(`/user/${this.uid}/config`);
        this.survey = this.af.database.object(`/user/${this.uid}/survey`);

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
