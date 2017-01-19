import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import * as moment from 'moment';


@Component({
  selector: 'app-user-steps-week',
  templateUrl: './user-steps-week.component.html',
  styleUrls: ['./user-steps-week.component.scss']
})

export class UserStepsWeekComponent implements OnInit {

  @Input() options: any;

  @Input() steps: any;
  @Input() userid: any;

  days: any;
  @Output() selectedDay = new EventEmitter();
  day: any;
  month: any;

  chart: any;
  series: Array<Object>;

  constructor() {

    this.days = [];
    this.options = {

      chart: {
        type: 'column',
        plotBackgroundColor: null,
        backgroundColor: '#f1f3f3',

      },

      title: {
        text: ''
      },

      subtitle: {
        text: ''
      },

      legend: {
        enabled: false,
        align: 'right',
        verticalAlign: 'middle',
        layout: 'vertical'
      },

      xAxis: {
        categories: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        labels: {
          x: 0
        }
      },

      yAxis: {
        min: 0,
        max: 15000,
        allowDecimals: false,
        visible: false,
        title: {
          text: 'Steps'
        }
      },
      plotOptions: {
        series: {
          pointWidth: 10
        }
      },

      series: [],
      credits: {
        enabled: false
      },
      /*
       responsive: {
       rules: [{
       condition: {
       maxWidth: 500
       },
       chartOptions: {
       legend: {
       align: 'center',
       verticalAlign: 'bottom',
       layout: 'horizontal'
       },
       yAxis: {
       labels: {
       align: 'left',
       x: 0,
       y: -5
       },
       title: {
       text: null
       }
       },
       subtitle: {
       text: null
       },
       credits: {
       enabled: false
       }
       }
       }]

       }
       */
    };
    this.series = [];
  }



  ngOnChanges(changes: any) {
    for (let propName in changes) {
      let chng = changes[propName];
      let cur = JSON.stringify(chng.currentValue);
      let prev = JSON.stringify(chng.previousValue);


      if (propName == 'steps' && (Object.keys(chng.previousValue).length > 0 && chng.previousValue.constructor === Object)) {
        this.steps = chng.currentValue;
        this.dateSelected(moment().startOf('day'));
        //console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
      }
      if (propName == 'userid' && chng.previousValue !== {}) {
        this.userid = chng.currentValue;
      }
    }

  }

  ngOnInit() {

    this.day = moment().startOf('day');
    this.month = moment().startOf('month');

    this.generateMonth();
    this.generateWeekSteps();

    this.selectedDay.emit({
      userid: this.userid,
      date: this.day,
    });

  }

  private generateMonth() {
    this.days = []; // reset

    // fill weeksdays from last month
    for (let i = this.month.weekday(); i > 0; i--) {
      this.days.push({
        date: moment(this.month).subtract(i, 'day'),
        classes: ['week__day', 'inactive'],
        events: [],
      });
    }

    for (let i = 0; i < this.month.daysInMonth(); i++) {
      let date = moment(this.month).add(i, 'day');
      let classes = ['week__day'];

      if (date.isSame(moment(), 'day')) {
        classes.push('today');
      }

      this.days.push({
        date: date,
        classes: classes,
        events: [],
      });
    }

    // fill weekdays for next month
    let length = this.days.length;
    if (length > 35) {
      length -= 7;
    }
    for (let i = 1; i <= (35 - length); i++) {
      this.days.push({
        date: moment(this.month).endOf('month').add(i, 'day'),
        classes: ['week__day', 'inactive'],
        events: [],
      });
    }
  }

  private generateWeekSteps() {


    let sources = {
      //default: [0, 0, 0, 0, 0, 0, 0]
    };

    for (let i = 0; i < 7; i++) {
      let date = moment(this.day).startOf('week').add(i, 'days');

      let dateFormated = date.format('YYYY-MM-DD');


      if (this.steps !== undefined) {
        if (this.steps[dateFormated] !== undefined) {


          for (let data in this.steps[dateFormated]) {
            let bundleId = this.steps[dateFormated][data].sourceBundleId;
            if (bundleId === undefined) {
              bundleId = 'default';
            }

            if (sources[bundleId] === undefined) {
              sources[bundleId] = [0, 0, 0, 0, 0, 0, 0];
              sources[bundleId][i] = 0;
            } else if (sources[bundleId][i] == undefined) {
              sources[bundleId][i] = 0;
            }
            sources[bundleId][i] += this.steps[dateFormated][data].value;

          }
          //console.log('day: ' + date.format);
        } else {
          // there is no step data available for this date, push a 0 value to all sources
          for (let source in sources) {
            sources[source][i] = 0;
          }

        }
        console.log('Day: ' + dateFormated);
        //this.data.labels.push(date);
        //console.log(sources)
      }
    }

    this.series = [];
    for (let source in sources) {
      console.log(sources[source]);
      let name = 'default';
      if (source.indexOf('health') > 0) {
        name = 'HealthKit';
      }
      if (source.indexOf('pebble') > 0) {
        name = 'Pebble';
      }
      if (source.indexOf('watch') > 0) {
        name = 'Apple Watch';
      }
      this.series.push({
        name: name,
        data: sources[source],
      });
    }


  }

  dateSelected(date) {
    this.selectedDay.emit({
      userid: this.userid,
      date: date
    });
    this.day = date;
    //this.generateMonth();
    this.generateWeekSteps();
    if (this.chart !== undefined) {
      var seriesLength = this.chart.series.length;
      for (var i = seriesLength - 1; i > -1; i--) {
        this.chart.series[i].remove();
      }

      for (let series in this.series) {
        this.chart.addSeries(this.series[series]);
      }
    }


  }

  prevMonth() {
    this.day = moment(this.month).subtract(1, 'month');
    this.month = moment(this.day).startOf('month');
    this.generateMonth();
  }

  nextMonth() {
    this.day = moment(this.month).add(1, 'month');
    this.month = moment(this.day).startOf('month');
    this.generateMonth();
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;

    for (let series in this.series) {
      this.chart.addSeries(this.series[series]);
    }

  }

}
