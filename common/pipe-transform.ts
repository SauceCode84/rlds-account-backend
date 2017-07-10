
import { ParamType } from "./paramtype";

export type Transform<T> = (value: T, metadata: ArgumentMetadata) => any;

export interface ArgumentMetadata {
  type: ParamType;
  metatype?: any;
  data?: any;
}

export interface PipeTransform {
  transform: Transform<any>;
}
