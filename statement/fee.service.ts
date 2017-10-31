import * as r from "rethinkdb";

import { Fee, FeeType, FeeTypes } from "./fee.model";

export const isFeeType = (value): value is FeeType => {
  if (typeof value === "string") {
    return FeeTypes.findIndex(feeType => feeType === value) !== -1;
  }

  return false;
}

export const getFees = async (connection): Promise<Fee[]> => {
  let cursor = await r.table("fees")
    .orderBy("sortOrder")
    .run(connection);

  return cursor.toArray();
}

export const getFeesByType = async (type: FeeType, connection): Promise<Fee[]> => {
  let cursor = await r.table("fees")
    .filter({ type })
    .orderBy("sortOrder")
    .run(connection);

  return await cursor.toArray();
}

export const getFee = async (id: string, connection): Promise<Fee> => {
  return r.table("fees")
    .get<Fee>(id)
    .run(connection);
}

export const insertFee = async (): Promise<void> => {
  let result = await r.table("fees")
    .insert({});
}
