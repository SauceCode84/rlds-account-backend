
export const isUndefined = (obj): obj is undefined => typeof obj === "undefined";
export const isFunction = (fn): boolean => typeof fn === "function";
export const isObject = (obj): obj is object => typeof obj === "object";
export const isString = (obj): obj is string => typeof obj === "string";
export const isConstructor = (fn): boolean => fn === "constructor";
export const isNil = (obj): boolean => isUndefined(obj) || obj === null;
export const isEmpty = (array): boolean => !(array && array.length > 0);

export const validatePath = (path): string => (path.charAt(0) !== "/") ? "/" + path : path;