import {Pipe, PipeTransform} from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';

@Pipe({
  name: 'alias',
  pure: false

})
export class AliasPipe implements PipeTransform {

  private alias: string;

  constructor(private db: AngularFireDatabase) {
  }

  transform(value: any, args?: any): any {
    if (value === 'empty') {
      return value;

    } else if (this.alias) {
      // pick from cache
      return this.alias;
    } else {
      this.db.object(`/users/${value}/alias`).subscribe(alias => {
        this.alias = alias.$value;
        return this.alias;
      });
    }


  }

}
