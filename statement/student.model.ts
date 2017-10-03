
import { IStatementModel } from "./statement.model";

export enum Grade {
  PrePrimary,
  Primary,
  Grade1,
  Grade2,
  Grade3,
  Grade4,
  Grade5,
  Intermediate,
  Advanced1
}

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
