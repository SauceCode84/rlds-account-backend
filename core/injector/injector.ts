import { isUndefined, isNil } from "../../common/shared.utils";
import { PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from "../../common/constants";
import { Metatype } from "../../common/interfaces";

import { InstanceWrapper } from "./instance-wrapper.interface";
import { Module } from "./module";

type ResolveCallback = (args) => void;

export class Injector {

  public loadInstance<T>(wrapper: InstanceWrapper<T>, collection, module: Module, context: Module[] = []) {
    const { name, metatype, inject } = wrapper;
    const currentMetatype: InstanceWrapper<T> = collection.get(name);

    if (isUndefined(currentMetatype)) {
      throw new Error("");
    }

    if (currentMetatype.isResolved) {
      return;
    }

    this.resolveConstructorParams<T>(wrapper, module, inject, context, () => {

    });
  }

  public resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    module: Module,
    inject: any[],
    context: Module[],
    callback: ResolveCallback) {
    
    let isResolved = true;
    const args = isNil(inject) ? this.reflectConstructorParams(wrapper.metatype) : inject;

    const instances = args.map((param) => {
      const paramWrapper = this.resolveSingleParam<T>(wrapper, param, module, context);

      if (paramWrapper.)
    });
  }

  public reflectConstructorParams<T>(type: Metatype<T>): any[] {
    const paramtypes: any[] = Reflect.getMetadata(PARAMTYPES_METADATA, type) || [];
    const selfParams = this.reflectSelfParams<T>(type);

    selfParams.forEach(({ index, param }) => paramtypes[index] = param);

    return paramtypes;
  }

  public reflectSelfParams<T>(type: Metatype<T>): any[] {
    return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || [];
  }

  public resolveSingleParam<T>(
    wrapper: InstanceWrapper<T>,
    param: Metatype<any> | string | symbol,
    module: Module,
    context: Module[]) {

    if (isUndefined(param)) {
      throw new Error();
    }
    
    return this.resolveComponentInstance<T>(module, )
  }

}
