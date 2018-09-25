  import * as r from "rethinkdb";

import { AccountFilterOptions } from "./accountFilterOptions";
import { excludeSubAccounts } from "./excludeSubAccounts";
import { getConnection } from "../data-access";
import { Account } from "../account.model";
import { executeQuery } from "../executeQuery";

const makeReadAccounts = (connection: r.Connection) => async (options: AccountFilterOptions = {}): Promise<Account[]> => {
  let { type, subType } = options;
  let accountSeq: r.Sequence = r.table("accounts");

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

  return await cursor.toArray<Account>();
}

export type ReadAccounts = (options?: AccountFilterOptions) => Promise<Account[]>;

export const readAccounts: ReadAccounts = executeQuery(makeReadAccounts);
