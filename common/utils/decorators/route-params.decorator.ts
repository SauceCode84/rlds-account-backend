import "reflect-metadata";
import { ROUTE_ARGS_METADATA } from "../../constants";
import { RouteParamTypes } from "../../enums/route-param-types.enum";
import { PipeTransform } from "../../interfaces/pipe-transform.interface";

export type ParamData = object | string | number;

export interface RouteParamsMetadata {
  [property: number]: {
    index: number;
    data?: ParamData;
  }
}

const assignMetadata = (
  args: RouteParamsMetadata,
  paramtype: RouteParamTypes,
  index: number,
  data?: ParamData,
  ...pipes: PipeTransform[]) => ({
  ...args,
  [`${paramtype}:${index}`]: {
    index,
    data,
    pipes
  }
});

const createRouteParamDecorator = (paramtype: RouteParamTypes) => {
  return (data?: ParamData): ParameterDecorator => (target, key, index) => {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) || {};
    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      assignMetadata(args, paramtype, index, data),
      target,
      key
    );
  };
};

const createRouteParamDecoratorWithPipes = (paramtype: RouteParamTypes) => {
  return (data?: ParamData, ...pipes: PipeTransform[]): ParameterDecorator => (target, key, index) => {
    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, target, key) || {};
    Reflect.defineMetadata(
      ROUTE_ARGS_METADATA,
      assignMetadata(args, paramtype, index, data, ...pipes),
      target,
      key
    );
  }
};

export const Request: () => ParameterDecorator = createRouteParamDecorator(RouteParamTypes.REQUEST);
export const Response: () => ParameterDecorator = createRouteParamDecorator(RouteParamTypes.RESPONSE);
export const Next: () => ParameterDecorator = createRouteParamDecorator(RouteParamTypes.NEXT);
export const Session: () => ParameterDecorator = createRouteParamDecorator(RouteParamTypes.SESSION);
export const Headers: (property?: string) => ParameterDecorator = createRouteParamDecorator(RouteParamTypes.HEADERS);

export const Req = Request;
export const Res = Response;

export const Query: (property?: string, ...pipes: PipeTransform[]) => ParameterDecorator = createRouteParamDecoratorWithPipes(RouteParamTypes.QUERY);
export const Body: (property?: string, ...pipes: PipeTransform[]) => ParameterDecorator = createRouteParamDecoratorWithPipes(RouteParamTypes.BODY);
export const Param: (property?: string, ...pipes: PipeTransform[]) => ParameterDecorator = createRouteParamDecoratorWithPipes(RouteParamTypes.PARAM);
