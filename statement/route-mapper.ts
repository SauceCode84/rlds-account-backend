
import { RequestHandler } from "express";

import { PATH_METADATA, METHOD_METADATA } from "./constants";
import { MetadataScanner } from "./metadata-scanner";
import { isUndefined } from "./util";

interface RoutePathProperties {
  path: string;
  requestMethod: string;
  targetCallback: RequestHandler
}

export class RouteMapper {

  private readonly metadataScanner = new MetadataScanner();

  constructor() {
  }

  public explore(instance: any, prototype?): RoutePathProperties[] {
    const instancePrototype = isUndefined(prototype) ? Object.getPrototypeOf(instance) : prototype;
    
    return this.metadataScanner.scanFromPrototype(
      instance,
      instancePrototype,
      method => this.exploreMethodMetadata(instance, instancePrototype, method));
  };

  private exploreMethodMetadata(instance, instancePrototype, methodName: string): RoutePathProperties {
    const targetCallback = instancePrototype[methodName];
    const routePath = Reflect.getMetadata(PATH_METADATA, targetCallback);
  
    if (isUndefined(routePath)) {
      return null;
    }
  
    const requestMethod = Reflect.getMetadata(METHOD_METADATA, targetCallback);
  
    return {
      targetCallback,
      requestMethod,
      path: routePath
    };
  };

}
