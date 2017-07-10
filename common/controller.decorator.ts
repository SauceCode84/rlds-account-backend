import { PATH_METADATA } from "./constants";
import { isObject, isUndefined } from "./utils";
import { ControllerMetadata } from "./controller-metadata";

export const Controller = (metadata?: ControllerMetadata | string): ClassDecorator => {
  let path = isObject(metadata) ? metadata[PATH_METADATA] : metadata;
  path = isUndefined(path) ? "/" : path;

  return (target: object) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
}
