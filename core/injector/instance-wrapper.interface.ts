import { Metatype } from "../../common/interfaces";

export interface InstanceWrapper<T> {
  name: any;
  metatype: Metatype<T>;
  instance: T;
  isResolved: boolean;
  inject?: Metatype<any>[];
  isNotMetatype?: boolean;
}
