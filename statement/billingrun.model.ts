
export enum BillingRunStatus {
  Pending = "pending",
  Completed = "completed"
}

export interface BillingRun {
  date: Date;
  status: BillingRunStatus;
  billings: Billing[];
}

export interface Billing {
  accountId: string;
  grade: string;
  student: {
    firstName: string;
    lastName: string;
  };
  details: string;
  amount: number;
}
