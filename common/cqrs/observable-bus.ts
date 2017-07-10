import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs";

import { EventObservable } from "./event-observable.interface";

const isEmpty = (array: any[]) => !(array && array.length > 0);

export class ObservableBus<T> extends Observable<T> implements EventObservable<T> {
  
  protected subject = new Subject<T>();

  constructor() {
    super();
    this.source = this.subject;
  }

  public ofType(...metatypes: any[]): Observable<T> {
    return this.filter(event => !isEmpty(metatypes.filter(metatype => event instanceof metatype)));
  }

}
