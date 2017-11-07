import * as r from "rethinkdb"; 

import { onConnect } from "./data-access";
import { isUpsert } from "./changefeed";

import { Transaction } from "./transaction.models";
import { Student } from "./student.model";
import { Account, AccountType } from "./account.model";

const calculateBalance = (balance: number, current: Transaction) => {
  balance += current.debit || 0;
  balance -= current.credit || 0;

  return balance;
}

const lastPaymentDate = (transactions: Transaction[]) => {
  let lastTx = transactions
    .filter(tx => tx.type === "payment")
    .last();

  if (lastTx) {
    return lastTx.date;
  }

  return null;
}

const getTxFromChange = (change: r.Change<Transaction>) => {
  if (isUpsert(change)) {
    return change.new_val;
  } else {
    return change.old_val;
  }
}

const getTxAccountIdFromChange = (change: r.Change<Transaction>) => getTxFromChange(change).accountId;

onConnect(async (err, connection) => {
  console.log("transactionChangeFeed");

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

  const getAccount = async (id: string) => {
    return r.table("accounts")
      .get<Account>(id)
      .run(connection);
  }

  const getAccountContainingSubAccount = async (accountId: string) => {
    let accountSeq = await r.table("accounts")
      .filter<Account>(account => account("subAccounts").contains(accountId))
      .run(connection);

    let [ account ] = await accountSeq.toArray<Account>();

    return account;
  }

  const isStudentAccount = async (id: string) => {
    let student = await r.table("students")
      .get<Student>(id)
      .run(connection);
    
    return student !== null;
  }

  const updateStudentAccount = (accountId: string, values: { balance: number, lastPayment: Date }) => {
    return r.table("students")
      .get(accountId)
      .update({ account: values })
      .run(connection);
  }

  let studentTxChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  studentTxChangeFeed.each(async (err, change: r.Change<Transaction>) => {
    let accountId = getTxAccountIdFromChange(change);
    
    if (!await isStudentAccount(accountId)) {
      return;
    }

    let transactions = await getTransactionsForAccount(accountId);
    
    let balance = transactions.reduce(calculateBalance, 0);
    let lastPayment = lastPaymentDate(transactions);

    await updateStudentAccount(accountId, { balance, lastPayment });
  });

  const calculateAccountValues = async (account: Account, includeSubAccounts: boolean = false) => {
    let transactions = await getTransactionsForAccount(account.id, includeSubAccounts);
    
    let debit = transactions.reduce((balance, tx) => balance + (tx.debit || 0), 0);
    let credit = transactions.reduce((balance, tx) => balance + (tx.credit || 0), 0);

    let balance: number;

    switch (account.type) {
      case AccountType.Asset:
      case AccountType.Expense:
        balance = credit - debit;
      
      case AccountType.Income:
      case AccountType.Equity:
      case AccountType.Liability:
        balance = debit - credit;
    }

    return { debit, credit, balance };
  }

  const updateAccountValues = async (account: Account, includeSubAccounts: boolean = false) => {
    let values = await calculateAccountValues(account, includeSubAccounts);
    
    await r.table("accounts")
      .get(account.id)
      .update(values)
      .run(connection);
  }

  let txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  txChangeFeed.each(async (err, change: r.Change<Transaction>) => {
    let account: Account;
    let tx = getTxFromChange(change);

    account = await getAccount(tx.accountId);

    if (account) {
      let debit = account.debit + (tx.debit || 0);
      let credit = account.credit + (tx.credit || 0);
      
      console.log("new debit", debit);
      console.log("new credit", credit);
      //updateAccountValues(account);
    }
    
    account = await getAccountContainingSubAccount(tx.accountId);
    
    if (account) {
      let debit = account.debit + (tx.debit || 0);
      let credit = account.credit + (tx.credit || 0);
      
      console.log("new debit", debit);
      console.log("new credit", credit);

      //updateAccountValues(account, true);
    }   
  });
});
