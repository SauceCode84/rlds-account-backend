import * as r from "rethinkdb";

import { Fee, FeeType, FeeTypes, FeePaymentOption } from "./fee.model";
import { getConnection } from "./data-access";
import { Grade } from "./student.model";

interface GetFeeOptions {
  includeAccountName?: boolean;
  includeGradeName?: boolean;
  type?: FeeType;
}

export class FeeService {

  constructor(private connection: r.Connection) { }

  static isFeeType(value): value is FeeType {
    if (typeof value === "string") {
      return FeeTypes.findIndex(feeType => feeType === value) !== -1;
    }
  
    return false;
  }

  async getFees({ includeAccountName = false, includeGradeName = false, type }: GetFeeOptions = {}): Promise<Fee[]> {
    let feeSeq: r.Sequence = r.table("fees");

    if (includeAccountName) {
      feeSeq = feeSeq.merge<Fee>(fee => {
        return {
          accountName: r.table("accounts")
            .get<Account>(fee("accountId"))("name")
            .default(null)
        };
      });
    }

    if (includeGradeName) {
      feeSeq = feeSeq.merge<Fee>(fee => {
        return {
          gradeName: r.table("grades")
            .get<Grade>(fee("grade"))("name")
            .default(null)
        };
      });
    }

    if (type) {
      feeSeq = feeSeq.filter({ type });
    }

    feeSeq = feeSeq.merge<Fee>(fee => {
      const paymentOptionSorts = r.expr({
        "single": 1,
        "monthly": 2,
        "termly": 3,
        "annually": 4
      });
      
      return {
        gradeSort: r.table("grades").get(fee("grade"))("sortOrder").default(null),
        paymentOptionSort: paymentOptionSorts(fee("paymentOption").default(null)).default(null)
      };
    });

    let cursor = await feeSeq
      .orderBy("sortOrder", "gradeSort", "paymentOptionSort")
      .without("gradeSort", "paymentOptionSort")
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

  async replaceFee(id: string, fee: Partial<Fee>) {
    await r.table("fees")
      .get(id)
      .replace({ ...fee, id })
      .run(this.connection);
  }

  async updateFee(id: string, fee: Partial<Fee>) {
    await r.table("fees")
      .get(id)
      .update(fee)
      .run(this.connection);
  }
  
}
