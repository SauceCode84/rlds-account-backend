
import { PATH_METADATA } from "./constants";
import { isObject, isUndefined } from "./utils";

interface ControllerMetadata {
  path?: string;
}

const Controller = (metadata?: ControllerMetadata | string): ClassDecorator => {
  let path = isObject(metadata) ? metadata[PATH_METADATA] : metadata;
  path = isUndefined(path) ? "/" : path;

  return (target: object) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
}
