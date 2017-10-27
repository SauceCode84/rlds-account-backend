/// <reference path="array.last.d.ts" />

if (!Array.prototype.last) {
  Array.prototype.last = function<T>(): T {
    return this[this.length - 1];
  };
}
