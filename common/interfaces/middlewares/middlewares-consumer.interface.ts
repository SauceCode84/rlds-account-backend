import { Metatype } from "../metatype-interface";
import { MiddlewareConfigProxy } from "./";

export interface MiddlewaresConsumer {
  apply(metatypes: Metatype<any> | Metatype<any>[]): MiddlewareConfigProxy;
}