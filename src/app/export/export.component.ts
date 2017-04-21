import {Component, OnInit} from '@angular/core';
import {AngularFire} from 'angularfire2';

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

  constructor(public af: AngularFire) {
  }

  export() {
    console.log('exporting');
    this.af.database.object('/', {preserveSnapshot: false}).subscribe(snapshot => {
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
