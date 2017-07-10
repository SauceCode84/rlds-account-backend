import "reflect-metadata";
import { FILTER_CATCH_EXCEPTIONS } from "../../constants";

export const Catch = (...errors): ClassDecorator => {
  return (target: object) => {
    Reflect.defineMetadata(FILTER_CATCH_EXCEPTIONS, errors, target);
  };
};