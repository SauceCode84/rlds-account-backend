
import "reflect-metadata";
import { IEvent, EVENTS_HANDLER_METADATA } from "./event-publisher";

export const EventHandler = (...events: IEvent[]): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(EVENTS_HANDLER_METADATA, events, target);
  };
};
