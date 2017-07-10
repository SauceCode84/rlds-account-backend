import "reflect-metadata";
import { ExceptionFilter } from "../../interfaces/exceptions/exception-filter.interface";
import { EXCEPTION_FILTERS_METADATA } from "../../constants";

const defineFiltersMetadata = (...filters: ExceptionFilter[]) => {
  return (target: object, key?, descriptor?) => {
    if (descriptor) {
      Reflect.defineMetadata(EXCEPTION_FILTERS_METADATA, filters, descriptor.value);
      return descriptor;
    }

    Reflect.defineMetadata(EXCEPTION_FILTERS_METADATA, filters, target);
    return target;
  };
};

export const UseFilters = (...filters: ExceptionFilter[]) => defineFiltersMetadata(...filters);
