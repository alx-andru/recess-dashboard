import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
declare var google: any;

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit, OnChanges {



  public chartData = new google.visualization.DataTable();


  public chartOptions = {
    title: undefined,
    width: '100%',
    height: 40,

    isStacked: true,
    //legend: {position: 'top', maxLines: 3},
    legend: 'none',
    hAxis: {
      textPosition: 'none',
      gridlines: {
        color: 'transparent'
      },
      baselineColor: 'none',

    },
    vAxis: {
      minValue: 0,
      gridlines: {
        count: 0
      },
      baselineColor: 'none',

    },
    chartArea: {
      left: 0,
      right: 0, // !!! works !!!
      bottom: 0,  // !!! works !!!
      top: 0,
      //width:"100%",
      //height:"100%"
    },
    colors: ['#f1c40f', '#27ae60', '#2980b9'],

  };

  public chartType = 'ColumnChart';

  @Input() chartid;
  @Input() data;

  constructor(private db: AngularFireDatabase) {
    this.chartData.addColumn('string', 'Time');
    this.chartData.addColumn('number', 'Activity');
    //this.chartData.addColumn('number', 'Goal');

    /*
     this.chartData.addRows([
     [moment().add(++i, 'day').toDate(), 37.8, 80.8],
     [moment().add(++i, 'day').toDate(), 30.9, 69.5],
     [moment().add(++i, 'day').toDate(), 25.4, 57],
     [moment().add(++i, 'day').toDate(), 11.7, 18.8],
     [moment().add(++i, 'day').toDate(), 11.9, 17.6],
     [moment().add(++i, 'day').toDate(), 8.8, 13.6],
     [moment().add(++i, 'day').toDate(), 7.6, 12.3],
     [moment().add(++i, 'day').toDate(), 12.3, 29.2],
     [moment().add(++i, 'day').toDate(), 16.9, 42.9],
     [moment().add(++i, 'day').toDate(), 12.8, 30.9],
     [moment().add(++i, 'day').toDate(), 5.3, 7.9],
     [moment().add(++i, 'day').toDate(), 6.6, 8.4],
     [moment().add(++i, 'day').toDate(), 4.8, 6.3],
     [moment().add(++i, 'day').toDate(), 4.2, 6.2],
     ]);
     */
  }

  ngOnChanges(changes: SimpleChanges): void {

  }


  ngOnInit(): void {
    console.log(this.data);
    if (undefined !== this.data) {
      const rowData = [];
      for (const data of this.data) {
        rowData.push([data.label, data.value]);
      }
      this.chartData.addRows(rowData);
    }

  }

}
