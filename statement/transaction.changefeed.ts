import * as r from "rethinkdb"; 
import * as Decimal from "decimal.js";

import { onConnect } from "./data-access";
import { getValueFromChange } from "./changefeed";

import { Transaction } from "./transaction.models";

import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";

onConnect(async (err, connection) => {
  console.log("transactionChangeFeed");

  const accountService = new AccountService(connection);
  const txService = new TransactionService(connection);

  let txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  txChangeFeed.eachAsync(async (change: r.Change<Transaction>) => {
    let { accountId } = getValueFromChange(change);
    let account = await accountService.getAccount(accountId);

    if (account) {
      let { debit, credit } = AccountService.calculateAccountValues(account, change);

      await accountService.updateAccountValues(account.id, { debit, credit });
    }
  });
  
});
