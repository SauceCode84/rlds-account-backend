
import * as r from "rethinkdb";
import { OnResponseFinish } from "./on-response-finish";

import { Transaction } from "./transaction.models";

import "../array.filterAsync";

export class TransactionService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }

  async allTransactions(): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  async accountTransactions(accountId: string): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .filter({ accountId })
      .without("accountId")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  async insertTransaction(transaction: Transaction): Promise<string> {
    transaction.date = new Date(transaction.date);
    
    let cursor = await r.table("transactions")
      .insert(transaction)
      .run(this.connection);

    let [ id ] = cursor.generated_keys;

    return id;
  }
  
  async finish(): Promise<void> {
    await this.connection.close();
  }

}
