import * as r from "rethinkdb";

import { AccountName } from "../account.model";

import { AccountFilterOptions } from "./account-filter-options";
import { excludeSubAccounts } from "./excludeSubAccounts";

export const readAccountNames = (connection: r.Connection) => async (options: AccountFilterOptions = {}): Promise<AccountName[]> => {
  let { type, subType } = options;
  let accountSeq: r.Sequence = await r.table("accounts");

  if (type) {
    accountSeq = accountSeq.filter({ type });

    if (subType) {
      accountSeq = accountSeq.filter({ subType });
    }
  }
  
  let cursor = await accountSeq
    .filter(excludeSubAccounts)
    .pluck("id", "name")
    .orderBy("name")
    .run(connection);

  return cursor.toArray<AccountName>();
}
