
import { Schema, SchemaTypes } from "mongoose";
import { IStudentModel } from "./student.model";

import DataAccess = require("./data-access");

export const StudentSchema: Schema = new Schema({
  firstName: String,
  lastName: String
}, {
  versionKey: false
});

let connection = DataAccess.mongooseConnection;

export const Student = connection.model<IStudentModel>("student", StudentSchema, "students");
