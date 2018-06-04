import * as r from "rethinkdb";
import { executeQuery } from "../executeQuery";

type UpdateAccountParams = { name: string };

const makeUpdateAccount = (connection: r.Connection) => async (id: string, { name }: UpdateAccountParams) => {
  await r.table("accounts")
  .get(id)
  .update({ name })
  .run(connection);
}

export type UpdateAccount = (id: string, { name }: UpdateAccountParams) => Promise<void>;

export const updateAccount: UpdateAccount = executeQuery(makeUpdateAccount);