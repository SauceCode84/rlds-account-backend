import { PATH_METADATA } from "../../constants";
import { isObject, isUndefined } from "../../shared.utils";
import { ControllerMetadata } from "../../interfaces/index";

export const Controller = (metadata?: ControllerMetadata | string): ClassDecorator => {
  let path = isObject(metadata) ? metadata[PATH_METADATA] : metadata;
  path = isUndefined(path) ? "/" : path;

  return (target: object) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
}
