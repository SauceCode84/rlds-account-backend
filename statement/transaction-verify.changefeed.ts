import * as r from "rethinkdb";

import { onConnect } from "./data-access";
import { Account } from "./account.model";
import { AccountService } from "./account.service";
import { TransactionService } from "./transaction.service";

onConnect(async (err, connection) => {
  let accountService = new AccountService(connection);
  let txService = new TransactionService(connection);
  
  let accountsCursor = await r.table("accounts").run(connection);

  await accountsCursor.eachAsync(async (account: Account) => {
    let accountValues = await txService.calculateAccountValues(account.id, true);

    console.log(`${account.name} (${account.type})`, account.balance, accountValues);

    await accountService.updateAccountValues(account.id, accountValues);
  });

});
