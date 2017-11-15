import * as r from "rethinkdb"; 
import * as Decimal from "decimal.js";

import { onConnect } from "./data-access";
import { isUpsert, getValueFromChange, isDelete, isUpdate, isInsert } from "./changefeed";

import { Transaction } from "./transaction.models";
import { Student } from "./student.model";
import { Account, AccountType, AccountValues } from "./account.model";
import { calculateBalance, lastPaymentDate, TransactionService } from "./transaction.service";
import { AccountService } from "./account.service";
import { StudentService } from "./student.service";

onConnect(async (err, connection) => {
  console.log("transactionChangeFeed");

  const accountService = new AccountService(connection);
  const txService = new TransactionService(connection);

  let txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  txChangeFeed.each(async (err, change: r.Change<Transaction>) => {
    let { accountId } = getValueFromChange(change);
    let account = await accountService.getAccount(accountId);

    if (account) {
      let { debit, credit } = AccountService.calculateAccountValues(account, change);
      
      accountService.updateAccountValues(account.id, { debit, credit });
    }
  });
});
