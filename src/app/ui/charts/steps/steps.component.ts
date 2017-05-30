import {Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';


@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit, OnChanges {



  constructor(private db: AngularFireDatabase) {


  }

  ngOnChanges(changes: SimpleChanges): void {

  }


  ngOnInit(): void {
  }

}
