import { MiddlewareConfigProxy } from "./middleware-config-proxy.interface";
import { Metatype } from "../metatype.interface";

export interface MiddlewaresConsumer {
  apply(metatypes: Metatype<any> | Metatype<any>[]): MiddlewareConfigProxy;
}