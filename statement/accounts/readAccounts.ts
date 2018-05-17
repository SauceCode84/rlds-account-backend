import * as r from "rethinkdb";

import { AccountFilterOptions } from "./accountFilterOptions";
import { excludeSubAccounts } from "./excludeSubAccounts";

export const readAccounts = (connection: r.Connection) => async (options: AccountFilterOptions = {}): Promise<Account[]> => {
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
    .orderBy("type", "name")
    .run(connection);

  return cursor.toArray<Account>();
}
