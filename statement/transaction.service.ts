import * as r from "rethinkdb";
import * as Decimal from "decimal.js";
import * as moment from "moment";

import { OnResponseFinish } from "./on-response-finish";

import { AccountValues } from "./account.model";
import { EntryType, Transaction, LedgerEntryDTO, TransactionDTO } from "./transaction.models";

import "../array.filterAsync";
import { isArray } from "util";
import { PageSliceOptions } from "./pagination";

export const calculateBalance = (balance: number, tx: Transaction): number => {
  return Decimal(balance)
    .plus(tx.debit || 0)
    .minus(tx.credit || 0)
    .toNumber();
}

export const lastPaymentDate = (transactions: Transaction[]): Date => {
  let lastTx = transactions
    .filter(tx => !!tx.credit)
    .last();

  if (lastTx) {
    return lastTx.date;
  }

  return null;
}

export class TransactionService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }

  async getAllTransactions(): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  private transactionsByAccountSeq(accountId: string, includeSubAccounts: boolean = false) {
    let txSeq = r.table("transactions")
      .filter({ accountId });
    
    if (includeSubAccounts) {
      let subAccountTxSeq = r.table("transactions")
        .getAll(r.args(r.table("accounts")
          .get(accountId)("subAccounts").default([])),
          { index: "accountId" })
        .concatMap(tx => {
          return r.table("accounts")
            .getAll(tx("accountId"))
            .map(account => {
              return {
                left: tx,
                right: { subAccountName: account("name") }
              };
            });
        })
        .zip();

      txSeq = txSeq.union(subAccountTxSeq);
    }

    return txSeq;
  }

  async getTransactionsByAccount(accountId: string, includeSubAccounts: boolean = false, pageOptions?: PageSliceOptions): Promise<Transaction[]> {
    let txSeq = this.transactionsByAccountSeq(accountId, includeSubAccounts)
      .without("accountId")
      .orderBy("date");
    
    if (!!pageOptions) {
      let { start, end } = pageOptions;

      txSeq = txSeq.slice(start, end);
    }

    let txCursor = await txSeq.run(this.connection);

    return await txCursor.toArray<Transaction>();
  }

  async transactionsCount(accountId: string, includeSubAccounts: boolean = false) {
    return this.transactionsByAccountSeq(accountId, includeSubAccounts)
      .count()
      .run(this.connection);
  }

  async transactionsByAccountCount(accountId: string, includeSubAccounts: boolean = false) {
    let txSeq = this.transactionsByAccountSeq(accountId, includeSubAccounts);
    
    return txSeq.count().run(this.connection);
  }

  async calculateAccountValues(accountId: string, includeSubAccounts: boolean = false): Promise<AccountValues> {
    let transactions = await this.getTransactionsByAccount(accountId, includeSubAccounts);
    
    let debit = transactions.reduce((balance, tx) => balance.plus(tx.debit || 0), new Decimal(0)).toNumber();
    let credit = transactions.reduce((balance, tx) => balance.plus(tx.credit || 0), new Decimal(0)).toNumber();
    
    return { debit, credit };
  }

  async getTransaction(id: string): Promise<Transaction> {
    return await r.table("transactions")
      .get<Transaction>(id)
      .run(this.connection);
  }

  async insertTransaction(transaction: Transaction): Promise<string> {
    transaction.date = moment(transaction.date).utc(true).toDate();
    
    let result = await r.table("transactions")
      .insert(transaction)
      .run(this.connection);

    let [ id ] = result.generated_keys;

    return id;
  }

  async insertTransactions(transactions: Transaction[]): Promise<string[]> {
    transactions.forEach(tx => tx.date = moment(tx.date).utc(true).toDate());

    let result = await r.table("transactions")
      .insert(transactions)
      .run(this.connection);

    return result.generated_keys;
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

  async insertLedgerEntry(date: Date, debit: string[], credit: string[]) {
    date = moment(date).utc(true).toDate();

    let result = await r.table("ledgerEntries")
      .insert({ date, debit, credit })
      .run(this.connection);

    let [ id ] = result.generated_keys;

    return id;
  }

  async postDoubleEntry(ledgerEntry: LedgerEntryDTO): Promise<PostDoubleEntryResponse> {
    const transactionFromEntry = (ledgerEntry: LedgerEntryDTO) => {
      let { date } = ledgerEntry;
      const mapEntry = mapEntryToTransaction(date);

      return (entryType: EntryType) => {
        let entries = ledgerEntry[entryType];

        if (!isArray(entries)) {
          entries = [entries];
        }

        return entries.map(mapEntry(entryType));
      }
    }

    const mapEntryToTransaction = (date: Date) => (entryType: EntryType) => (entry: TransactionDTO) => {
      let { accountId, details, amount } = entry;
      let tx: Transaction = { date, accountId, details };
      
      tx[entryType] = amount;

      return tx;
    }

    const createTransactionsFromEntry = (ledgerEntry: LedgerEntryDTO) => {
      let createTransactions = transactionFromEntry(ledgerEntry);

      return {
        debits: createTransactions("debit"),
        credits: createTransactions("credit")
      };
    }

    let { date } = ledgerEntry;

    let { debits, credits } = createTransactionsFromEntry(ledgerEntry);
    
    let debitIds = await this.insertTransactions(debits);
    let creditIds = await this.insertTransactions(credits);

    let id = await this.insertLedgerEntry(date, debitIds, creditIds);

    return { id, debitIds, creditIds };
  }
  
  async finish(): Promise<void> {
    await this.connection.close();
  }

}

type PostDoubleEntryResponse = { id: string, debitIds: string[], creditIds: string[] };
