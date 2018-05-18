import * as r from "rethinkdb";

import { AccountBalances } from "../account.model";
import { excludeSubAccounts } from "./excludeSubAccounts";

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

export const readAccountBalances = (connection: r.Connection) => async (): Promise<AccountBalances[]> => {
  let accountSeq = await r.table("accounts")
      .filter(excludeSubAccounts)
      .pluck("id", "name", "type", "balance")
      .orderBy("type", "name")
      .run(connection);

    let accountBalances = await accountSeq.toArray<AccountBalances>();

    return accountBalances.map(withAccountBalanceValues);
}
