
import { Document } from "mongoose";
import { IStudentModel } from "./student.model";

export interface IUserModel {
  name: string;
}

export enum LineType {
  ClassFees,
  ExamFees,
  Payment
}

export interface IStatementLineModel {
  date: Date;
  description: string;
  type?: LineType;
  debit?: number;
  credit?: number;
  balance?: number;
}

export interface IStatementModel extends Document {
  student: IStudentModel;
  lines: IStatementLineModel[];
}
