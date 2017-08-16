
interface Array<T> {
  flatMap<U>(selector: (t: T) => U[]): U[];
}
