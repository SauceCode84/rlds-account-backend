
import "reflect-metadata";
import { PATH_METADATA } from "./constants";

export const Controller = (path: string = "/"): ClassDecorator => {
  return (target: Object) => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
};
