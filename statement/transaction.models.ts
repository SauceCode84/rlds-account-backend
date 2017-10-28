
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
  date: Date;
  details: string;
  type?: TransactionType;
  debit?: number;
  credit?: number;
  accountId: string;
}
