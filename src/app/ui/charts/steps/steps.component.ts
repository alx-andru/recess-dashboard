import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as moment from 'moment';
import {_} from 'lodash';
import {AngularFire} from 'angularfire2';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit, OnChanges {
  options: any;
  data: any;
  type: any;

  day: moment.Moment;
  steps: any;


  @Input() uid: string;

  constructor(private af: AngularFire) {


    this.data = {
      labels: [],
      series: []
    };

    this.options = {
      axisX: {
        divisor: 5,
        labelInterpolationFnc: function (value) {
          return moment(value).format('DD.MM.');
        }
      }
    };

    this.type = 'Bar';
  }

  ngOnInit() {
    this.day = moment();
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes['uid'] !== undefined) {
      this.uid = changes['uid'].currentValue;
      this.calculateSteps();
    }

  }

  calculateSteps() {
    this.data = Object.assign({}, {
      labels: [],
      series: []
    });

    const sources = [];
    let firstDay = moment();
    const steps = this.af.database.list(`/user/${this.uid}/data/steps/`).subscribe(snapshots => {
      this.steps = [];

      snapshots.forEach(snapshot => {

        const result = _.chain(snapshot)
          .groupBy(function (value) {
            return value.sourceName;
          })
          .map(function (value, key) {
            const sum = _.reduce(value, function (memo, val) {
              return memo + val.value;
            }, 0);
            const day = moment(snapshot.$key, 'YYYY-MM-DD');

            // determine first day of collected data to start the chart from there
            if (day.isBefore(firstDay)) {
              firstDay = day;
            }

            return {source: key, steps: sum, day: day};
          })
          .value();

        const source = result[0].source;
        if (!_.find(sources, function (src) {
            return src.source === source;
          })) {
          sources.push({source: source, id: sources.length});
        }
        this.steps.push(result[0]);

      });

      // now time to distribute to series
      const grouped = _.groupBy(this.steps, function (step) {
        return step.source;
      });

      // initialize labels based on first day

      const daysCollected = moment().diff(firstDay, 'days');
      this.data.labels = [];
      for (let i = 0; i <= moment().diff(firstDay, 'days'); i++) {
        const day = firstDay.clone().add(i, 'days');
        this.data.labels.push(day);
      }

      // initialize sources
      _.each(sources, src => {
        this.data.series.push([]);
      });

      _.each(grouped, source => {
        _.each(source, step => {
          _.each(this.data.labels, (day, idx) => {
            if (day.isSame(step.day, 'day')) {
              const sourceId = _.find(sources, src => {
                return src.source === step.source;
              });
              this.data.series[sourceId.id][idx] = step.steps;
            }
          });

        });
      });


      this.data = Object.assign({}, this.data);

    });
  }

}
