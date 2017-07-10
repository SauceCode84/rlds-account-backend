import { PARAMTYPES_METADATA } from "../../constants";

const flatten = (array) => {
  const flat = [].concat(...array);
  
  return flat.some(Array.isArray) ? flatten(flat) : flat;
};

export const Dependencies = (...metadata): ClassDecorator => {
  const flattenDependencies = flatten(metadata);

  return (target: object) => {
    Reflect.defineMetadata(PARAMTYPES_METADATA, flattenDependencies, target);
  };
};
