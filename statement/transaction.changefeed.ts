import * as r from "rethinkdb"; 
import { onConnect } from "./data-access";
import { Transaction } from "./transaction.models";
import { Change, isUpsert } from "./changefeed";

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

const getTxAccountIdFromChange = (change: Change<Transaction>) => {
  if (isUpsert(change)) {
    return change.new_val.accountId;
  } else {
    return change.old_val.accountId;
  }
}

onConnect(async (err, connection) => {
  console.log("transactionChangeFeed");

  const getTransactionsForAccount = async (accountId: string) => {
    let txSeq = await r.table("transactions")
    .filter({ accountId })
    .orderBy("date")
    .run(connection);
  
    return await txSeq.toArray();
  }

  const updateStudentAccount = (accountId: string, values: { balance: number, lastPayment: Date }) => {
    return r.table("students")
      .get(accountId)
      .update({ account: values })
      .run(connection);
  }

  let txChangeFeed = await r.table("transactions")
    .changes()
    .run(connection);

  txChangeFeed.each(async (err, change: Change<Transaction>) => {
    let accountId = getTxAccountIdFromChange(change);
    let transactions: Transaction[] = await getTransactionsForAccount(accountId);

    let balance = transactions.reduce(calculateBalance, 0);
    let lastPayment = lastPaymentDate(transactions);

    await updateStudentAccount(accountId, { balance, lastPayment });
  });
});
