import * as r from "rethinkdb";

import { onConnect } from "./data-access";
import { Transaction } from "./transaction.models";
import { getValueFromChange } from "./changefeed";
import { StudentService } from "./student.service";
import { TransactionService, calculateBalance, lastPaymentDate } from "./transaction.service";

onConnect(async (err, connection) => {

  console.log("studentTxChangeFeed");

  const studentService = new StudentService(connection);
  const txService = new TransactionService(connection);

  let studentTxChangeFeed = await r.table("transactions")
    .changes()
    .filter((change: r.Expression<r.Change<Transaction>>) => {
      let accountId = r.branch(change("new_val").ne(null),
        change("new_val")("accountId"),
        change("old_val")("accountId"));

      return r.table("students")
        .getAll(accountId)
        .count().gt(0);
    })
    .run(connection);

  studentTxChangeFeed.eachAsync(async (change: r.Change<Transaction>) => {
    let { accountId } = getValueFromChange(change);
    let transactions = await txService.getTransactionsByAccount(accountId);
    
    let balance = transactions.reduce(calculateBalance, 0);
    let lastPayment = lastPaymentDate(transactions);

    await studentService.updateStudentAccount(accountId, { balance, lastPayment });
  });

});
