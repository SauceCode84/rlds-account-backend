
import * as r from "rethinkdb";

export const isInsert = <T>(change: r.Change<T>): boolean => change.new_val && change.old_val === null;
export const isUpdate = <T>(change: r.Change<T>): boolean => change.old_val !== null && change.new_val !== null;
export const isUpsert = <T>(change: r.Change<T>): boolean => isInsert(change) || isUpdate(change);
export const isDelete = <T>(change: r.Change<T>): boolean => change.old_val && change.new_val === null;

export type Insert = "insert";
export type Update = "update";
export type Upsert = Insert | Update;
export type Delete = "delete";

export type ChangeType = Insert | Update | Upsert | Delete;

export const getChangeType = <T>(change: r.Change<T>): ChangeType => {
  if (isInsert(change)) return "insert";
  if (isUpdate(change)) return "update";
  if (isDelete(change)) return "delete";
}

export const hasValueChanged = <T, K extends keyof T>(change: r.Change<T>, key: K) => {
  if (isUpdate(change)) {
    return change.old_val[key] === change.new_val[key];
  }

  return true;  
}

export const getValueFromChange = <T>(change: r.Change<T>) => {
  if (isUpsert(change)) {
    return change.new_val;
  } else {
    return change.old_val;
  }
}

/*export type ChangeSet<T> = { [K in keyof T]: T[K] };

export const getNewValues = <T, K extends keyof T>(change: r.Change<T>, ...keys: K[]): ChangeSet<T> => {
  let changeSet: ChangeSet<T> = {};

  keys = keys || (Object.keys(change) as K[]);

  keys.forEach(key => {
    let newValue = change.new_val;

    if (!newValue || !newValue[key]) {
      return;
    }

    changeSet[key] = change.new_val[key];
  });

  return changeSet;
};*/
