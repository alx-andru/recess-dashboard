import {AfterViewInit, Component, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {AngularFireDatabase} from 'angularfire2/database';
import 'peity';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  user: any;
  sub: any;

  survey: any;
  today: any = moment();
  config: any;

  userdata = [];

  distance: any;

  isConversation: boolean;

  uid: any;


  testingSomething = 'teste';
  testingSomething2 = 'teste2';

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

        const stepsRef = this.db.list(`/user/${this.uid}/data/ui/user/steps`);
        const activityRef = this.db.list(`/user/${this.uid}/data/ui/user/activity`);

        stepsRef.subscribe(stepsSnapshots => {
          this.userdata = [];
          const usrData = {};

          for (const snap of stepsSnapshots) {
            // console.log(snap);
            if (undefined === usrData[snap.$key]) {
              usrData[snap.$key] = {};
            }
            usrData[snap.$key].steps = snap.$value;
          }

          activityRef.subscribe(activitySnapshots => {
            for (const snap of activitySnapshots) {
              console.log(snap);
              if (undefined === usrData[snap.$key]) {
                usrData[snap.$key] = {};
              }
              usrData[snap.$key].activityTotal = snap.totalHours || 0;
              usrData[snap.$key].activity = snap.details || [];
            }

            this.userdata = Object.keys(usrData).map(p => Object.assign(usrData[p], {day: p}));

            console.log(this.userdata);

          });


        });


      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('onchange');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngAfterViewInit() {
    //firjQuery('.bar').peity('bar');
    // .html('test');


  }

}
