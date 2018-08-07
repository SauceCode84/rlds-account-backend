
function pipe<T1>(first: T1): T1;
function pipe<T1, T2>(first: T1, second: (a: T1) => T2): T2;
function pipe<T1, T2, T3>(first: T1, second: (a: T1) => T2, third: (b: T2) => T3): T3;
function pipe<T1, T2, T3, T4>(first: T1, second: (a: T1) => T2, third: (b: T2) => T3, fourth: (c: T3) => T4): T4;
function pipe(first: any, ...args: Function[]): any {
  return (
    args && args.length
    ? args.reduce((result, next) => next(result), first instanceof Function ? first() : first)
    : first instanceof Function ? first() : first
  );
}

const increment = (value: number) => value + 1;
const double = (value: number) => value * 2;
const square = (value: number) => value * value;
const mapToString = (value: number) => value.toString();

let result = pipe(2, increment, mapToString)