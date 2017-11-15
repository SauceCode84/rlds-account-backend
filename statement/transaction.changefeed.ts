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

/*const getTxFromChange = (change: r.Change<Transaction>) => {
  if (isUpsert(change)) {
    return change.new_val;
  } else {
    return change.old_val;
  }
}*/

//const getTxAccountIdFromChange = (change: r.Change<Transaction>) => getValueFromChange(change).accountId;

onConnect(async (err, connection) => {
  console.log("transactionChangeFeed");

  const accountService = new AccountService(connection);
  const txService = new TransactionService(connection);

  /*const getTransactionsForAccount = async (accountId: string, includeSubAccounts: boolean = false) => {
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
  }*/

  /*const getAccount = async (id: string) => {
    return r.table("accounts")
      .get<Account>(id)
      .run(connection);
  }*/

  /*const getAccountContainingSubAccount = async (accountId: string) => {
    let accountSeq = await r.table("accounts")
      .filter<Account>(account => account("subAccounts").contains(accountId))
      .run(connection);

    let [ account ] = await accountSeq.toArray<Account>();

    return account;
  }*/

  /*const updateStudentAccount = (accountId: string, values: { balance: number, lastPayment: Date }) => {
    return r.table("students")
      .get(accountId)
      .update({ account: values })
      .run(connection);
  }*/

  

  /*let studentTxChangeFeed = await r.table("transactions")
    .changes()
    .filter((change: r.Expression<r.Change<Transaction>>) => {
      let accountId = r.branch(change("new_val")("accountId").ne(null),
        change("new_val")("accountId"),
        change("old_val")("accountId"));

      console.log("filter accountId", accountId);

      return r.table("students")
        .getAll(accountId)
        .count().eq(1);
    })
    .run(connection);*/

  /*
  r.db("rlds")
  .table("transactions")
  .changes()
  .filter(function (tx) {
    return r.db("rlds")
      .table("students")
      .getAll(tx("new_val")("accountId"))
      .count().eq(1)
  })
  */

  /*studentTxChangeFeed.each(async (err, change: r.Change<Transaction>) => {
    let { accountId } = getValueFromChange(change);

    console.log("studentTxChangeFeed", accountId);

    if (!await studentService.isStudentAccount(accountId)) {
      return;
    }

    let transactions = await txService.getTransactionsByAccount(accountId);
    
    let balance = transactions.reduce(calculateBalance, 0);
    let lastPayment = lastPaymentDate(transactions);

    await updateStudentAccount(accountId, { balance, lastPayment });
  });*/

  /*const calculateAccountValues = async (account: Account, includeSubAccounts: boolean = false) => {
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
  }*/

  /*const updateAccountValues = async (account: Account, includeSubAccounts: boolean = false) => {
    let values = await txService.calculateAccountValues(account.id, includeSubAccounts);
    
    await r.table("accounts")
      .get(account.id)
      .update(values)
      .run(connection);
  }*/

  let txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  /*type AccountValues = {
    debit?: number;
    credit?: number;
  }*/

  /*const calculateAccountChange = (change: r.Change<AccountValues>) => {
    let debit: number, credit: number;

    if (isInsert(change)) {
      debit = change.new_val.debit || 0;
      credit = change.new_val.credit || 0;
    } else if (isUpdate(change)) {
      debit = Decimal(change.new_val.debit || 0).minus(change.old_val.debit || 0).toNumber();
      credit = Decimal(change.new_val.credit || 0).minus(change.old_val.credit || 0).toNumber();
    } else if (isDelete(change)) {
      debit = Decimal(change.old_val.debit || 0).times(-1).toNumber();
      credit = Decimal(change.old_val.credit || 0).times(-1).toNumber();
    }

    return { debit, credit };
  }*/

  txChangeFeed.each(async (err, change: r.Change<Transaction>) => {
    let { accountId } = getValueFromChange(change);
    //let { debit, credit } = AccountService.calculateAccountChange(change);
    
    let account = await accountService.getAccount(accountId);

    if (account) {
      /*let newDebit = Decimal(account.debit).plus(debit).toNumber();
      let newCredit = Decimal(account.credit).plus(credit).toNumber();

      console.log("TX changefeed...");
      console.log(`Change: ${debit}, Old Debit: ${account.debit}, New Debit: ${newDebit}`);
      console.log(`Change: ${credit}, Old Credit: ${account.credit}, New Credit: ${newCredit}`);*/
      
      let { debit, credit } = AccountService.calculateAccountValues(account, change);
      
      accountService.updateAccountValues(account.id, { debit, credit });

      /*await r.table("accounts")
        .get(accountId)
        .update({ debit, credit })
        .run(connection);*/
    }
    
    /*if (account) {
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
    }*/
  });
});

/*
r.db("rlds")
  .table("transactions")
  .insert(r.db("rlds")
  .table("transactions")
  .filter({ type: "registration" })
  .merge(tx => {
    return r.db("rlds").table("students").get(tx("accountId")).pluck("firstName", "lastName")
  })
  .map(tx => {
    return {
      date: tx("date"),
      details: r.expr("Registration Fees - ").add(tx("firstName"), " ", tx("lastName")),
      credit: tx("debit"),
      accountId: "4dcb36cc-fc51-44ad-b6fe-2b2ced635a7c"
    }
  })
  .coerceTo("array"))
*/
