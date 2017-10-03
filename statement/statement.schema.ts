/*
import { Schema, SchemaTypes } from "mongoose";
import { LineType, IStatementModel } from "./statement.model";

import DataAccess = require("./data-access");

export const StatementSchema: Schema = new Schema({
  student: {
    type: SchemaTypes.ObjectId,
    ref: "student"
  },
  lines: [{
    date: Date,
    description: String,
    type: {
      type: String,
      enum: ["ClassFees", "ExamFees", "Payment"],
      required: false
    },
    debit: Number,
    credit: Number,
    balance: Number
  }]
},
{
  versionKey: false,
  toJSON: {
    transform: function(doc, ret: IStatementModel) {
      ret.lines = ret.lines.map((retLine: any) => {
        delete retLine._id;
        return retLine;
      })
    }
  }
});

let connection = DataAccess.mongooseConnection;

export const Statement = connection.model<IStatementModel>("statement", StatementSchema, "statements");
*/