import * as r from "rethinkdb";
import * as Decimal from "decimal.js";

import { onConnect } from "./data-access";
import { Account, AccountType, AccountValues } from "./account.model";
import { isInsert, isUpdate, isDelete } from "./changefeed";
import { TransactionService } from "./transaction.service";

interface AccountName {
  id: string;
  name: string;
}

const accountDefaults = {
  subAccounts: [],
  debit: 0,
  credit: 0,
  balance: 0
};

export class AccountService {

  constructor(private connection: r.Connection) { }

  static calculateBalance(accountValues: AccountValues): number {
    let { debit, credit } = accountValues;
  
    return Decimal(debit || 0).minus(credit || 0).toNumber();
  }

  static calculateAccountChange(change: r.Change<AccountValues>): AccountValues {
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
  }

  static calculateAccountValues(account: Account, change: r.Change<AccountValues>): AccountValues {
    let { debit, credit } = AccountService.calculateAccountChange(change);
  
    return {
      debit: Decimal(account.debit).plus(debit).toNumber(),
      credit: Decimal(account.credit).plus(credit).toNumber()
    };
  }

  async getAccounts({ type }: { type?: AccountType } = {}): Promise<Account[]> {
    let accountSeq: r.Sequence = await r.table("accounts");
    
    if (type) {
      accountSeq = accountSeq.filter({ type });
    }

    let cursor = await accountSeq
      .filter(this.excludeSubAccounts)
      .run(this.connection);

    return cursor.toArray<Account>();
  }

  async getAccountNames({ type }: { type?: AccountType } = {}): Promise<AccountName[]> {
    let accountSeq: r.Sequence = await r.table("accounts");

    if (type) {
      accountSeq = accountSeq.filter({ type });
    }

    let cursor = await accountSeq
      .filter(this.excludeSubAccounts)
      .pluck("id", "name")
      .orderBy("name")
      .run(this.connection);

    return cursor.toArray<AccountName>();
  }

  async getAccount(id: string): Promise<Account> {
    return r.table("accounts")
      .get<Account>(id)
      .run(this.connection);
  }

  async getSubAccounts(id: string): Promise<Account[]> {
    let subAccountsSeq = r.table("accounts").get(id)("subAccounts").default([]);

    let subAccountsCursor = await r.table("accounts")
      .getAll(r.args(subAccountsSeq))
      .orderBy("name")
      .run(this.connection);

    return subAccountsCursor.toArray<Account>();
  }

  private excludeSubAccounts(subAccount: r.Expression<Account>) {
    return r.table("accounts")
      .filter(account => account("subAccounts").default([]).contains(subAccount("id")))
      .count().eq(0);
  }

  async insertAccount({ id, name, type }: { id?: string, name: string, type: AccountType}) {
    let newAccount = Object.assign({ name, type }, accountDefaults) as Account;

    if (id) {
      newAccount.id = id;
    }

    let result = await r.table("accounts")
      .insert(newAccount)
      .run(this.connection);

    let newId: string;
    
    if (result.generated_keys && result.generated_keys.length > 0) {
      [ newId ] = result.generated_keys;
    } else {
      newId = id;
    }

    return newId;
  }

  async addSubAccount(accountId: string, subAccountId: string) {
    let account = await r.table("accounts")
      .get<Account>(accountId)
      .update({ subAccounts: r.row("subAccounts").append(subAccountId) })
      .run(this.connection);
  }

  async updateAccount(id: string, { name }: { name: string }) {
    await r.table("accounts")
      .get(id)
      .update({ name })
      .run(this.connection);
  }

  async updateBalance(id: string, balance: number) {
    await r.table("accounts")
      .get(id)
      .update({ balance })
      .run(this.connection);
  }

  async updateAccountValues(id: string, { debit, credit }: AccountValues) {
    await r.table("accounts")
      .get(id)
      .update({ debit, credit })
      .run(this.connection);
  }

}

/*
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


r.db("rlds")
  .table("accounts")
  .getAll(r.args(r.db("rlds")
    .table("accounts")
    .get("a8cdd7af-dc3f-4747-a7e2-ec59fdaa30d6")("subAccounts").default([])))
  .orderBy("name")
  

r.db("rlds")
  .table("transactions")
  //.filter({ accountId: "059fd19f-8609-49ef-b313-0e326f47ee2c" })
  //.delete()
  
  .insert(r.db("rlds")
  .table("transactions")
  .filter({ type: "private" })
  .orderBy("date")
  .map(function (tx) {
    var student = r.db("rlds")
      .table("students")
      .get(tx("accountId"))
      .pluck("firstName", "lastName");
    return {
      accountId: "059fd19f-8609-49ef-b313-0e326f47ee2c",
      date: tx("date"),
      credit: tx("debit"),
      details: r.expr("Private Fees - ").add(student("firstName"), " ", student("lastName"))
    };
  }))



*/