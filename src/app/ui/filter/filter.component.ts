import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Input() isDark = false;
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  filter: any;

  constructor() {

  }

  ngOnInit() {
  }

  search(val: any) {
    this.onSearch.emit({filter: val});


  }

}
