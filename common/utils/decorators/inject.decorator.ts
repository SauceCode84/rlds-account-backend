import "reflect-metadata";
import { SELF_DECLARED_DEPS_METADATA } from "../../constants";
import { isFunction } from "../../utils";

export const Inject = (param): ParameterDecorator => {
   return (target: object, key: string, index: number) => {
    const args = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target);
    const type = isFunction(param) ? param.name : param;

    args.push({ index, param: type });
    Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, args, target);
   };
};