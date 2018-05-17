
// Accounting Equation
// Assets = Liabilities + Equity + (Income - Expenses)
// Equity = Assets - Liabilities - (Income - Expenses)
// Equity = Assets - Liabilities - Income + Expenses

/*

             Debit       Credit
            --------    --------
Equity      Decrease    Increase
Asset       Increase    Decrease
Liability   Decrease	  Increase
Income      Decrease    Increase
Expense     Increase    Decrease

*/

export enum AccountType {
  Asset = "asset",
  Liability = "liability",
  Equity = "equity",
  Income = "income",
  Expense = "expense"
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  subType?: string;
  subAccounts?: Account[];
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface AccountName {
  id: string;
  name: string;
}

export type AccountValues = {
  debit?: number;
  credit?: number;
}

/*let cashAccount: IAccountModel = {
  name: "Cash",
  type: AccountType.Asset,
  lines: [
    {
      date: new Date(),
      description: "Payment from ...",
      debit: 100
    }
  ]
};

let classFeesAccount: IAccountModel = {
  name: "Class Fees",
  type: AccountType.Income,
  lines: [
    {
      date: new Date(),
      description: "",
      credit: 100
    },
    {
      date: new Date(),
      description: "",
      credit: 250
    }
  ]
}

let studentAccount: IAccountModel = {
  name: "Student",
  type: AccountType.Asset,
  lines: [
    {
      date: new Date(),
      description: "",
      debit: 100
    },
    {
      date: new Date(),
      description: "",
      credit: 100
    },
    {
      date: new Date(),
      description: "",
      debit: 250
    }
  ]
}

type AccountBalance = { debit: number, credit: number };

function sumAccount(account: IAccountModel) {
  return account.lines.reduce((balance: AccountBalance, line: IAccountLineModel) => {
    balance.debit += line.debit || 0;
    balance.credit += line.credit || 0;

    return balance;
  }, { debit: 0, credit: 0 });
}

function getAccountBalance(account: IAccountModel): number {
  let balance = sumAccount(account);

  switch (account.type) {
    case AccountType.Asset:
    case AccountType.Expense:
      return balance.debit - balance.credit;

    case AccountType.Equity:
    case AccountType.Income:
    case AccountType.Liability:
      return balance.credit - balance.debit;
  }
}

let cashBalance = getAccountBalance(cashAccount);
let classFeesBalance = getAccountBalance(classFeesAccount);
let studentBalance = getAccountBalance(studentAccount);

console.log("cashBalance", cashBalance);
console.log("classFeesBalance", classFeesBalance);
console.log("studentBalance", studentBalance);*/
