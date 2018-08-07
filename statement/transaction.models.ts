
export type TransactionType =
  "class" |
  "private" |
  "registration" |
  "exam" |
  "festival" |
  "costume" |
  "interest" |
  "payment";

export interface Transaction {
  id?: string;
  accountId: string;
  accountName?: string;
  date: Date;
  details: string;
  type?: TransactionType;
  debit?: number;
  credit?: number;
  subAccountName?: string;
}

export type EntryType = "debit" | "credit";

export interface LedgerEntry {
  id?: string;
  date: Date;
  debit: string[];
  credit: string[];
}

export interface DoubleEntryTransaction {
  date: Date;
  amount: number;
  debit: {
    accountId: string;
    details: string;
  };
  credit: {
    accountId: string;
    details: string;
  };
}

export interface TransactionDTO {
  accountId: string;
  details: string;
  amount: number;
}

export interface LedgerEntryDTO {
  date: Date;
  debit: TransactionDTO | TransactionDTO[];
  credit: TransactionDTO | TransactionDTO[];
}
