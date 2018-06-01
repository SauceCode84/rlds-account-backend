import * as r from "rethinkdb";

import { getConnection } from "../data-access";
import { Account } from "../account.model";
import { executeQuery } from "../executeQuery";

const makeGetAccountById = (connection: r.Connection) => async (id: string): Promise<Account> => {
  return await r.table("accounts")
    .get<Account>(id)
    .run(connection);
}

export type ReadAccountById = (id: string) => Promise<Account>;

export const readAccountById: ReadAccountById = executeQuery(makeGetAccountById);
