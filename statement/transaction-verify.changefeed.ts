import * as r from "rethinkdb";

import { onConnect } from "./data-access";
import { Account, AccountType } from "./account.model";
import { Transaction } from "./transaction.models";

onConnect(async (err, connection) => {
  const getTransactionsForAccount = async (accountId: string, includeSubAccounts: boolean = false) => {
    let txSeq = await r.table("transactions")
      .filter({ accountId });

    if (includeSubAccounts) {
      let subAccountTxSeq = r.table("transactions")
        .getAll(r.args(r.table("accounts").get(accountId)("subAccounts").default([])), { index: "accountId" });

      txSeq = txSeq.union(subAccountTxSeq);
    }

    let txCursor = await txSeq
      .orderBy("date")
      .run(connection);
  
    return await txCursor.toArray<Transaction>(); 
  }

  const calculateAccountBalance = (type: AccountType, debit: number, credit: number) => {
    switch (type) {
      case AccountType.Asset:
      case AccountType.Expense:
        return debit - credit;
      
      case AccountType.Income:
      case AccountType.Equity:
      case AccountType.Liability:
        return credit - debit;
    }
  }

  const calculateAccountValues = async (account: Account, includeSubAccounts: boolean = false) => {
    let transactions = await getTransactionsForAccount(account.id, includeSubAccounts);
    
    let debit = transactions.reduce((balance, tx) => balance + (tx.debit || 0), 0);
    let credit = transactions.reduce((balance, tx) => balance + (tx.credit || 0), 0);
    let balance = debit - credit;

    return { debit, credit, balance };
  }

  let accountsCursor = await r.table("accounts").run(connection);

  accountsCursor.each<Account>(async (err, account) => {
    //let txs = await getTransactionsForAccount(account.id, true);
    
    console.log(`${account.name} (${account.type})`, await calculateAccountValues(account, true));
  });
})
