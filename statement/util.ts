
export const isFunction = (fn): boolean => typeof fn === "function";
export const isConstructor = (fn): boolean => fn === "constructor";
export const isUndefined = (obj): obj is undefined => typeof obj === "undefined";
export const isNil = (obj): boolean => isUndefined(obj) || obj === null;
export const validatePath = (path): string => (path.charAt(0) !== "/") ? "/" + path : path;
