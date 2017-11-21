
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
