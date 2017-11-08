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

  async getFees({ includeAccountName = false, type }: { includeAccountName?: boolean, type?: FeeType } = {}): Promise<Fee[]> {
    let feeSeq: r.Sequence = r.table("fees");

    if (includeAccountName) {
      feeSeq = feeSeq.merge<Fee>(fee => {
        return {
          accountName: r.table("accounts")
            .get<Account>(fee("accountId"))("name").default(null)
        }
      });
    }

    if (type) {
      feeSeq = feeSeq.filter({ type });
    }

    let cursor = await feeSeq
      .orderBy("sortOrder")
      .run(this.connection);

    return cursor.toArray<Fee>();
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
