import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/filter";

export interface EventObservable<T> {
  ofType(...events): Observable<T>;
}

const isEmpty = (array: any[]) => !(array && array.length > 0);

export class ObservableBus<T> extends Observable<T> implements EventObservable<T> {
  
  protected subject: Subject<T> = new Subject<T>();

  constructor() {
    super();
    this.source = this.subject;
  }

  ofType(...metatypes: any[]): Observable<T> {
    return this.filter(event => !isEmpty(metatypes.filter(metatype => event instanceof metatype)));
  }

}
