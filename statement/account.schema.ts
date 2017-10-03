/*
import { Schema, SchemaTypes } from "mongoose";
import { IAccountModel } from "./account.model";

import DataAccess = require("./data-access");

export const AccountSchema: Schema = new Schema({
  name: String,
  type: String,
  lines: [{
    _id: false,
    date: { type: Date, default: Date.now },
    description: String,
    debit: Number,
    credit: Number,
    category: String
  }],
  subAccounts: [{ type: SchemaTypes.ObjectId, ref: "account" }]
}, { versionKey: false });

let connection = DataAccess.mongooseConnection;

export const Account = connection.model<IAccountModel>("account", AccountSchema, "accounts");
*/