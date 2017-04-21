import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss']
})
export class BotsComponent implements OnInit {
  title: string;

  constructor() {
    this.title = 'Bots';

  }

  ngOnInit() {

  }

}
