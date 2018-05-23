import * as r from "rethinkdb";

import { getConnection } from "../data-access";
import { Account } from "../account.model";

const makeGetAccountById = (connection: r.Connection) => async (id: string): Promise<Account> => {
  return r.table("accounts")
    .get<Account>(id)
    .run(connection);
}

export type ReadAccountById = (id: string) => Promise<Account>;

export const readAccountById = async (id: string): Promise<Account> => {
  let connection = await getConnection();
  let account = makeGetAccountById(connection)(id);
  
  await connection.close();

  return account;
}
