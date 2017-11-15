import * as r from "rethinkdb";
import * as Decimal from "decimal.js";

import { onConnect } from "./data-access";
import { Account } from "./account.model";
import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";

onConnect(async (err, connection) => {
  let accountService = new AccountService(connection);
  let txService = new TransactionService(connection);
  
  let accountsCursor = await r.table("accounts").run(connection);

  accountsCursor.each<Account>(async (err, account) => {
    let accountValues = await txService.calculateAccountValues(account.id, true);

    console.log(`${account.name} (${account.type})`, account.balance, accountValues);

    await accountService.updateAccountValues(account.id, accountValues);
  });
});
