
export interface Change<T> {
  old_val?: T;
  new_val?: T;
}

export const isInsert = <T>(change: Change<T>): boolean => change.new_val && change.old_val === null;
export const isUpdate = <T>(change: Change<T>): boolean => change.old_val !== null && change.new_val !== null;
export const isUpsert = <T>(change: Change<T>): boolean => isInsert(change) || isUpdate(change);
export const isDelete = <T>(change: Change<T>): boolean => change.old_val && change.new_val === null;

export const hasValueChanged = <T, K extends keyof T>(change: Change<T>, key: K) => {
  if (isUpdate(change)) {
    return change.old_val[key] === change.new_val[key];
  }

  return true;  
}

export type ChangeSet<T, K extends keyof T> = { [key: string]: T[K] };

export const getNewValues = <T, K extends keyof T>(change: Change<T>, ...keys: K[]): ChangeSet<T, K> => {
  let changeSet: ChangeSet<T, K> = {};

  keys = keys || (Object.keys(change) as K[]);

  keys.forEach(key => {
    let newValue = change.new_val;

    if (!newValue || !newValue[key]) {
      return;
    }

    changeSet[key] = change.new_val[key];
  });

  return changeSet;
};
