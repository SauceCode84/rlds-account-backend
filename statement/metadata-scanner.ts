
import { isConstructor, isFunction, isNil } from "./util";

export class MetadataScanner {

  scanFromPrototype<T, R>(instance, prototype, callback: (name: string) => R): R[] {
    const propertyNames = Object.getOwnPropertyNames(prototype);
  
    return propertyNames.filter((method) => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
  
        if (descriptor.set || descriptor.get) {
          return false;
        }
  
        return !isConstructor(method) && isFunction(prototype[method]);
      })
      .map(callback)
      .filter(metadata => !isNil(metadata));
  };
  

}
