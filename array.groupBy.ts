
type KeySelector<T, TKey> = (value: T) => TKey;

declare global {
  interface Array<T> {
    groupBy<TKey>(keySelector: KeySelector<T, TKey>): Map<TKey, T[]>;
  }
}

if (!Array.prototype.groupBy) {
  Array.prototype.groupBy = function<TKey, T>(keySelector: KeySelector<T, TKey>): Map<TKey, T[]> {
    const map = new Map<TKey, T[]>();

    this.forEach((value: T) => {
      const key: TKey = keySelector(value);
      const collection: T[] = map.get(key);

      if (!collection) {
        map.set(key, [ value ]);
      } else {
        collection.push(value);
      }
    });

    return map;
  }
}

export const groupBy = <T, TKey>(array: T[], keySelector: KeySelector<T, TKey>): Map<TKey, T[]> => {
  return array.groupBy(keySelector);
}
