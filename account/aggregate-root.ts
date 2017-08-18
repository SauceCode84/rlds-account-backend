
import { IEvent } from "./event-publisher";

export abstract class AggregateRoot {

  private readonly changes: IEvent[] = [];

  publish(event: IEvent) { }

  uncommitChanges() {
    this.changes.length = 0;
  }

  getUncommitedChanges(): IEvent[] {
    return this.changes;
  }

  loadFromHistory(history: IEvent[]) {
    history.forEach(event => this.apply(event, true));
  }

  apply(event: IEvent, isFromHistory: boolean = false) {
    if (!isFromHistory) {
      this.changes.push(event);
    }
    
    this.publish(event);

    let handler = this.getEventHandler(event);
    handler && handler(event);
  }

  private getEventHandler(event: IEvent) {
    let handlerName = `on${this.getEventName(event)}`;
    return this[handlerName];
  }

  private getEventName(event): string {
    let { constructor } = Object.getPrototypeOf(event);
    return constructor.name;
  }

}
