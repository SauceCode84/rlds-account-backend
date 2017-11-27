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

  const updateAccountValues = async (change: r.Change<Transaction>) => {
    console.log("updateAccountValues");

    let { accountId } = getValueFromChange(change);
    let account = await accountService.getAccount(accountId);

    if (account) {
      let { debit, credit } = AccountService.calculateAccountValues(account, change);

      await accountService.updateAccountValues(account.id, { debit, credit });
    }
  }

  const updateLedgerEntries = async (change: r.Change<Transaction>) => {
    console.log("updateLedgerEntries");

    let { id, debit, credit } = getValueFromChange(change);
    //console.log("id", id);
    //console.log("debit", debit);
    //console.log("credit", credit);

    let cursor = await r.table("ledgerEntries")
      .map((ledgerEntry: r.Expression<LedgerEntry>) => {
        return {
          id: ledgerEntry("id"),
          transactions: [ledgerEntry("debitId"), ledgerEntry("creditId")]
        };
      })
      .filter((ledgerEntry: r.Expression<LedgerEntryTXMapping>) => ledgerEntry("transactions").contains(id))
      .run(connection);

    let [ value ] = await cursor.toArray<LedgerEntryTXMapping>();

    //console.log("value", value);

    if (value) {
      let index = value.transactions.indexOf(id);

      if (index > -1) {
        value.transactions.splice(index, 1);
        let [ otherId ] = value.transactions;
        let otherTxValue = {};

        if (debit) {
          otherTxValue["credit"] = debit;
        } else if (credit) {
          otherTxValue["debit"] = credit;
        }
        
        //console.log("otherId", otherId);
        //console.log("otherTxValue", otherTxValue);
        
        txService.updateTransaction(otherId, otherTxValue);
      }
    }
  }

  const txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  const tasks = [updateAccountValues, updateLedgerEntries];

  txChangeFeed.eachAsync(async (change: r.Change<Transaction>) => {
    await Promise.all(tasks.map(task => task(change)));
  });

});

interface LedgerEntry {
  id: string;
  amount: number;
  date: Date;
  debitId: string;
  creditId: string;
}

interface LedgerEntryTXMapping {
  id: string;
  transactions: string[];
}
