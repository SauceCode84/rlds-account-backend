import "reflect-metadata";
import { SHARED_MODULE_METADATA } from "../../constants";

export const Shared = (token: string = "global"): ClassDecorator => {
  return (target: FunctionConstructor) => {
    const Type = class extends target {
      constructor(...args) {
        super(...args);
      }
    };

    Reflect.defineMetadata(SHARED_MODULE_METADATA, token, Type);
    Object.defineProperty(Type, "name", { value: target.name });

    return Type;
  };
};