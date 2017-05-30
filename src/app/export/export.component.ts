import {Component, OnInit} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  title = 'Export Data';

  icon = 'import_export';
  buttonTitle = 'Export';


  public data: any;

  constructor(public db: AngularFireDatabase) {
  }

  export() {
    console.log('exporting');
    this.db.object('/', {preserveSnapshot: false}).subscribe(snapshot => {
      console.log('exported');
      this.data = snapshot;
      this.saveData(snapshot, 'export.json');


    });


  }

  ngOnInit() {
  }

  saveData(data, fileName) {
    const a = document.createElement('a');
    document.body.appendChild(a);


    const json = JSON.stringify(data),
      blob = new Blob([json], {type: 'octet/stream'}),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

  }

}
