import * as r from "rethinkdb";
import { getConnection } from "../data-access";

import { AccountType } from "../account.model";
import { excludeSubAccounts } from "./excludeSubAccounts";

/**
 * Options to filter the list of accounts by type and sub-type
 */
type AccountFilterOptions = {
  
  /**
   * The account type to filter
   */
  type?: AccountType;

  /**
   * The account sub-type to filter
   */
  subType?: string;
};

const getAccounts = (connection: r.Connection) => async (options: AccountFilterOptions = {}): Promise<Account[]> => {
  let { type, subType } = options;
  let accountSeq: r.Sequence = await r.table("accounts");
  
  if (type) {
    accountSeq = accountSeq.filter({ type });

    if (subType) {
      accountSeq = accountSeq.filter({ subType });
    }
  }

  let cursor = await accountSeq
    .filter(excludeSubAccounts)
    .orderBy("type", "name")
    .run(connection);

  return cursor.toArray<Account>();
}
