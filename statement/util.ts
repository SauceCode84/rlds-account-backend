
export const isFunction = (fn): boolean => typeof fn === "function";
export const isConstructor = (fn): boolean => fn === "constructor";
export const isUndefined = (obj): obj is undefined => typeof obj === "undefined";
export const isNil = (obj): boolean => isUndefined(obj) || obj === null;
export const validatePath = (path): string => (path.charAt(0) !== "/") ? "/" + path : path;

export const compare = <T>(a: T, b: T): number => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
};

export const compareCaseInsensitive = (a: string, b: string): number => {
  return compare(a.toLowerCase(), b.toLowerCase());
};

const isPromise = <T>(value): value is Promise<T> => {
  return Promise.resolve(value) === value;
}
