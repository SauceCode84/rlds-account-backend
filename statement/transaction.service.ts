
import * as r from "rethinkdb";
import { OnResponseFinish } from "./on-response-finish";

import { Transaction } from "./transaction.models";

import "../array.filterAsync";

export class TransactionService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }

  async getAllTransactions(): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  async getTransactionsByAccount(accountId: string): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .filter({ accountId })
      .without("accountId")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  async getTransaction(id: string): Promise<Transaction> {
    return await r.table("transactions")
      .get<Transaction>(id)
      .run(this.connection);
  }

  async insertTransaction(transaction: Transaction): Promise<string> {
    transaction.date = new Date(transaction.date);
    
    let result = await r.table("transactions")
      .insert(transaction)
      .run(this.connection);

    let [ id ] = result.generated_keys;

    return id;
  }

  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<void> {
    if (transaction.date) {
      transaction.date = new Date(transaction.date);
    }

    await r.table("transactions")
      .get<Transaction>(id)
      .update(transaction)
      .run(this.connection);
  }
  
  async finish(): Promise<void> {
    await this.connection.close();
  }

}
