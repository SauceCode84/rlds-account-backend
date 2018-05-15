import * as r from "rethinkdb";
import { Account } from "../account.model";

/**
 * Builds an `Expression` which excludes the sub-accounts for the account specified
 * @param account The `Account` for which the expression should exclude the sub-accounts
 */
export const excludeSubAccounts = (account: r.Expression<Account>): r.Expression<boolean> => {
  return r.table("accounts")
    .filter(currentAccount => currentAccount("subAccounts").default([]).contains(account("id")))
    .count().eq(0);
}
