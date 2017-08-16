
import { Document } from "mongoose";
import { IStatementModel } from "./statement.model";

export interface IStudentModel extends Document {
  firstName: string;
  lastName: string;
}
