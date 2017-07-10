
export const isUndefined = (obj): obj is undefined => typeof obj === "undefined";
export const isFunction = (fn): boolean => typeof fn === "function";
export const isObject = (fn): fn is object => typeof fn === "object";
