
import { IStatementModel } from "./statement.model";

export interface Grade {
  id: string;
  name: string;
  sortOrder: number;
}

export interface StudentAccount {
  balance: number;
  lastPayment?: Date;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  grade: Grade;
  account: StudentAccount;
  paymentOption: PaymentOption;
  contacts: string[];
  active: boolean;
}

export interface Contact {
  id?: string;
  name: string;
  relation: string;
  email: string;
  cellphone: string;
}

export type StudentKeys = keyof Student;

/*export enum Grade {
  PrePrimary,
  Primary,
  Grade1,
  Grade2,
  Grade3,
  Grade4,
  Grade5,
  Intermediate,
  Advanced1
}*/

export enum PaymentOption {
  Monthly = "monthly",
  Termly = "termly",
  Annually = "annually"
}

export interface IStudentModel {
  firstName: string;
  lastName: string;
  grade: number;
  emails: string[];
  paymentOption: PaymentOption;
}
