import * as r from "rethinkdb";

import { Fee, FeeType, FeeTypes } from "./fee.model";
import { getConnection } from "./data-access";

export class FeeService {

  constructor(private connection: r.Connection) { }

  static isFeeType(value): value is FeeType {
    if (typeof value === "string") {
      return FeeTypes.findIndex(feeType => feeType === value) !== -1;
    }
  
    return false;
  }

  async getFees(): Promise<Fee[]> {
    let cursor = await r.table("fees")
      .orderBy("sortOrder")
      .run(this.connection);

    return cursor.toArray();
  }

  async getFeesByType(type: FeeType): Promise<Fee[]> {
    let cursor = await r.table("fees")
      .filter({ type })
      .orderBy("sortOrder")
      .run(this.connection);

    return await cursor.toArray();
  }
  
  async getFee(id: string): Promise<Fee> {
    return r.table("fees")
      .get<Fee>(id)
      .run(this.connection);
  }
  
  async insertFee(newFee: Partial<Fee>): Promise<string> {
    let result = await r.table("fees")
      .insert(newFee)
      .run(this.connection);
    
    let [ id ] = result.generated_keys;

    return id;
  }

  async updateFee(id: string, fee: Partial<Fee>) {
    await r.table("fees")
      .get(id)
      .update(fee)
      .run(this.connection);
  }
  
}
