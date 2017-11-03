
interface Array<T> {

  filterAsync(predicate: (value: T) => Promise<boolean>): Promise<T[]>;

}

