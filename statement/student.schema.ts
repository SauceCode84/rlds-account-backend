/*
import { Schema, SchemaTypes } from "mongoose";
import { IStudentModel } from "./student.model";

import DataAccess = require("./data-access");

export const StudentSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  grade: Number,
  emails: [String],
  paymentOption: String
}, {
  versionKey: false
});

let connection = DataAccess.mongooseConnection;

export const Student = connection.model<IStudentModel>("student", StudentSchema, "students");
*/