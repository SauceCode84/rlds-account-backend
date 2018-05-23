import * as r from "rethinkdb";

import { getConnection, onConnect } from "../data-access";
import { Account } from "../account.model";

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

export const readSubAccountsForAccount = async (id: string): Promise<Account[]> => {
  let connection = await getConnection();
  let subAccounts = await makeReadSubAccountsForAccount(connection)(id);

  await connection.close();

  return subAccounts;
}
