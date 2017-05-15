import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-bots',
  templateUrl: './bots.component.html',
  styleUrls: ['./bots.component.scss']
})
export class BotsComponent implements OnInit, OnDestroy {
  title: string;
  sub: any;
  showMessages: boolean;

  constructor(private route: ActivatedRoute) {
    this.title = 'Bots';

  }

  ngOnInit() {

  }

  handleDetail(e) {
    this.showMessages = true;
  }

  ngOnDestroy() {
  }

}
