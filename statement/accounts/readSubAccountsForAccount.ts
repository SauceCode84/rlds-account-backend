import * as r from "rethinkdb";

import { getConnection, onConnect } from "../data-access";
import { Account } from "../account.model";
import { executeQuery } from "../executeQuery";

const subAccountsSequence = (id: string): r.Sequence => {
  return r.table("accounts")
    .get(id)("subAccounts")
    .default([]);
}

const makeReadSubAccountsForAccount = (connection: r.Connection) => async (id: string): Promise<Account[]> => {
  let subAccountsCursor = await r.table("accounts")
    .getAll(r.args(subAccountsSequence(id)))
    .orderBy("name")
    .run(connection);

  return subAccountsCursor.toArray<Account>();
}

export type ReadSubAccountsForAccount = (id: string) => Promise<Account[]>;

export const readSubAccountsForAccount: ReadSubAccountsForAccount = executeQuery(makeReadSubAccountsForAccount);
