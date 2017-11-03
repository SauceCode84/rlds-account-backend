/// <reference path="array.filterAsync.d.ts" />

if (!Array.prototype.filterAsync) {
  Array.prototype.filterAsync = async function<T>(predicate: (value: T) => Promise<boolean>) {
    let mappings = (this as T[]).map(async item => {
      return (await predicate(item)) ? item : undefined;
    });

    let results = await Promise.all(mappings);

    return results.filter(item => item !== undefined);
  }
}
