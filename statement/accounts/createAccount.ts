import * as r from "rethinkdb";

import { getConnection } from "../data-access";
import { Account, AccountType } from "../account.model";

/*async insertAccount({ id, name, type }: { id?: string, name: string, type: AccountType}) {
  let newAccount = Object.assign({ name, type }, accountDefaults) as Account;

  if (id) {
    newAccount.id = id;
  }

  let result = await r.table("accounts")
    .insert(newAccount)
    .run(this.connection);

  let newId: string;
  
  if (result.generated_keys && result.generated_keys.length > 0) {
    [ newId ] = result.generated_keys;
  } else {
    newId = id;
  }

  return newId;
}*/

type NewAccount = { id?: string, name: string, type: AccountType};

const accountDefaults = {
  subAccounts: [],
  debit: 0,
  credit: 0,
  balance: 0
};

const makeCreateAccount = (connection: r.Connection) => async ({ id, name, type }: NewAccount) => {
  let newAccount = { ...accountDefaults, name, type } as Account;
  
  if (id) {
    newAccount.id = id;
  }

  let result = await r.table("accounts")
    .insert(newAccount)
    .run(connection);

  let newId: string;

  if (result.generated_keys && result.generated_keys.length > 0) {
    [ newId ] = result.generated_keys;
  } else {
    newId = id;
  }

  return newId;
}

export const createAccount = async (newAccount: NewAccount) => {
  let connection = await getConnection();
  let newId = await makeCreateAccount(connection)(newAccount);

  await connection.close();

  return newId;
}
