import * as r from "rethinkdb";

import { AccountName } from "../account.model";

import { AccountFilterOptions } from "./accountFilterOptions";
import { excludeSubAccounts } from "./excludeSubAccounts";
import { getConnection } from "../data-access";

const makeReadAccountNames = (connection: r.Connection) => async (options: AccountFilterOptions = {}): Promise<AccountName[]> => {
  let { includeSubAccounts, type, subType } = options;
  let accountSeq: r.Sequence = await r.table("accounts");

  if (!includeSubAccounts) {
    accountSeq = accountSeq.filter(excludeSubAccounts);
  }

  if (type) {
    accountSeq = accountSeq.filter({ type });

    if (subType) {
      accountSeq = accountSeq.filter({ subType });
    }
  }
  
  let cursor = await accountSeq
    .pluck("id", "name")
    .orderBy("name")
    .run(connection);

  return cursor.toArray<AccountName>();
}

export type ReadAccountNames = (options?: AccountFilterOptions) => Promise<AccountName[]>;

export const readAccountNames = async (options?: AccountFilterOptions): Promise<AccountName[]> => {
  let connection = await getConnection();
  let accountNames = await makeReadAccountNames(connection)(options);

  await connection.close();

  return accountNames;
}
