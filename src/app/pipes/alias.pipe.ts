import {Pipe, PipeTransform} from '@angular/core';
import {AngularFire} from 'angularfire2';

@Pipe({
  name: 'alias',
  pure: false

})
export class AliasPipe implements PipeTransform {

  private alias: string;

  constructor(private af: AngularFire) {
  }

  transform(value: any, args?: any): any {
    if (value === 'empty') {
      return value;

    } else if (this.alias) {
      // pick from cache
      return this.alias;
    } else {
      this.af.database.object(`/users/${value}/alias`).subscribe(alias => {
        this.alias = alias.$value;
        return this.alias;
      });
    }


  }

}
