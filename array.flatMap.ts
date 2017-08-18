/// <reference path="array.flatMap.d.ts" />

if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function <T, U>(selector: (t: T) => U[]): U[] {
    return this.reduce((prev: U[], value: T) => {
      return prev.concat(selector(value));
    }, []);
  }
}
