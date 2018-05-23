import * as r from "rethinkdb";

import { AccountBalances } from "../account.model";
import { excludeSubAccounts } from "./excludeSubAccounts";
import { getConnection } from "../data-access";

const withAccountBalanceValues = (accountBalance: AccountBalances) => {
  let { balance } = accountBalance;

  if (!!balance) {
    if (balance > 0) {
      accountBalance.debit = balance;
    } else {
      accountBalance.credit = Math.abs(balance);
    }

    return accountBalance;
  }
}

const makeReadAccountBalances = (connection: r.Connection) => async (): Promise<AccountBalances[]> => {
  let accountSeq = await r.table("accounts")
      .filter(excludeSubAccounts)
      .pluck("id", "name", "type", "balance")
      .orderBy("type", "name")
      .run(connection);

    let accountBalances = await accountSeq.toArray<AccountBalances>();

    return accountBalances.map(withAccountBalanceValues);
}

export type ReadAccountBalances = () => Promise<AccountBalances[]>;

export const readAccountBalances = async (): Promise<AccountBalances[]> => {
  let connection = await getConnection();
  let accountBalances = makeReadAccountBalances(connection)();

  await connection.close();
  
  return ;
}
