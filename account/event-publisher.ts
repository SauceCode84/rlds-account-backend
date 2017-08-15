
import { ObservableBus } from "./observable-bus";
import { AggregateRoot } from "./aggregate-root";
import { Type } from "./type";

export const EVENTS_HANDLER_METADATA = "__eventHandler__";

export interface IEvent { }

export interface IEventBus {
  publish<TEvent extends IEvent>(event: TEvent);
}

export interface IEventHandler<TEvent extends IEvent> {
  handle(event: TEvent);
}

export type EventHandlerType = Type<IEventHandler<IEvent>>;

export class EventBus extends ObservableBus<IEvent> implements IEventBus {
  
  constructor() {
    super();
  }

  publish<TEvent extends IEvent>(event: TEvent) {
    this.subject.next(event);
  }

  ofType<TEvent extends IEvent>(event: TEvent & { name: string }) {
    return this.ofEventName(event.name);
  }

  bind<TEvent extends IEvent>(handler: IEventHandler<IEvent>, name: string) {
    const stream = name ? this.ofEventName(name) : this.subject;
    stream.subscribe(event => handler.handle(event));
  }

  register(handlers: EventHandlerType[]) {
    handlers.forEach(handler => this.registerHandler(handler));
  }

  protected registerHandler(handler: EventHandlerType) {
    let instance: IEventHandler<IEvent>;

    instance = new handler();

    if (!instance) {
      return;
    }

    let eventNames = this.reflectEventNames(handler);
    eventNames.map(event => this.bind(instance, event.name));
  }

  protected ofEventName(name: string) {
    return this.subject.filter(event => this.getEventName(event) === name);
  }

  private getEventName(event): string {
    let { constructor } = Object.getPrototypeOf(event);
    return constructor.name;
  }

  private reflectEventNames(handler: EventHandlerType): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

}

export class EventPublisher {

  constructor(private readonly eventBus: EventBus) { }

  mergeContext<T extends Type<AggregateRoot>>(aggregateRootType: T): T {
    const eventBus = this.eventBus;

    return class extends aggregateRootType {
      publish(event: IEvent) {
        eventBus.publish(event);
      }
    }
  }

  mergeObjectContext<T extends AggregateRoot>(aggregateRoot: T): T {
    const eventBus = this.eventBus;

    aggregateRoot.publish = (event: IEvent) => {
      eventBus.publish(event);
    };

    return aggregateRoot;
  }

}
