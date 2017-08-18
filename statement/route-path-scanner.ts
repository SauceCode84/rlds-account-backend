
import { RequestHandler, Router } from "express";

import { PATH_METADATA, METHOD_METADATA } from "./constants";
import { MetadataScanner } from "./metadata-scanner";
import { isUndefined } from "./util";

interface RoutePathProperties {
  path: string;
  requestMethod: string;
  targetCallback: RequestHandler
}

export class RoutePathScanner {

  private readonly metadataScanner = new MetadataScanner();

  public scanPaths(instance: any, prototype?): RoutePathProperties[] {
    const instancePrototype = isUndefined(prototype) ? Object.getPrototypeOf(instance) : prototype;
    
    return this.metadataScanner.scanFromPrototype(
      instance,
      instancePrototype,
      method => this.getMethodMetadata(instance, instancePrototype, method));
  };

  private getMethodMetadata(instance, instancePrototype, methodName: string): RoutePathProperties {
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
