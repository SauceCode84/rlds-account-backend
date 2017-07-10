import "reflect-metadata";
import { metadata } from "../../constants";
import { ModuleMetadata } from "../../interfaces/modules/module-metadata.interface";

const metadataKeys = [
  metadata.MODULES,
  metadata.EXPORTS,
  metadata.COMPONENTS,
  metadata.CONTROLLERS
];

const validateKeys = (keys: string[]) => {
  const isKeyValid = (key) => metadataKeys.findIndex(k => k === key) > 0;
  const validateKey = (key) => {
    if (!isKeyValid(key)) {
      throw new Error(`Invalid key: '${key}'`);
    }
  };

  keys.forEach(validateKey);
};

export const Module = (properties: ModuleMetadata): ClassDecorator => {
  const propertyKeys = Object.keys(properties);
  validateKeys(propertyKeys);

  return (target: object) => {
    for (let property in properties) {
      if (properties.hasOwnProperty(property)) {
        Reflect.defineMetadata(property, properties[property], target);
      }
    }
  };
};
