import * as r from "rethinkdb";

import { StudentService } from "./student.service";
import { FeeService } from "./fee.service";

import { PaymentOption, Student } from "./student.model";
import { Billing, BillingRun, BillingRunStatus } from "./billingrun.model";
import { Fee } from "./fee.model";
import { Transaction } from "./transaction.models";

export class BillingRunService {

  private studentService: StudentService;
  private feeService: FeeService;

  constructor(private connection: r.Connection) {
    this.studentService = new StudentService(connection);
    this.feeService = new FeeService(connection);
  }

  async getBillingRun(id: string): Promise<BillingRun> {
    return r.table("billingRuns")
    .get<BillingRun>(id)
    .run(this.connection);
  }
  
  async billingRunExists(id: string): Promise<boolean> {
    let count = await r.table("billingRun")
      .filter({ id })
      .count()
      .run(this.connection);

    return count > 0;
  }

  async createBillingRun(month: string, date: Date, paymentOptions: PaymentOption[]): Promise<string> {
    let fees = await this.feeService.getFees();
    let students = await this.studentService.allStudents();
    
    let billings: Billing[] = [];
  
    students
      .filter(this.isValidPaymentOption(paymentOptions))
      .forEach(student => {
        let billing = this.createBillingForStudent(student, fees, month);
        billings.push(billing);
      });
    
    let billingRun: BillingRun = {
      date: new Date(date),
      status: BillingRunStatus.Pending,
      billings
    };
  
    return this.insertBillingRun(billingRun);
  }

  async completeBillingRun(id: string) {
    let billingRun = await this.getBillingRun(id);
    let txs = this.createTransactions(billingRun);
  
    await r.table("transactions")
      .insert(txs)
      .run(this.connection);
  
    await r.table("billingRuns")
      .get(id)
      .update({ status: BillingRunStatus.Completed })
      .run(this.connection);
  }

  private createTransactions(billingRun: BillingRun): Transaction[] {
    return billingRun.billings.map(billing => {
      return {
        date: billingRun.date,
        debit: billing.amount,
        details: billing.details,
        accountId: billing.accountId
      };
    });
  }

  private async insertBillingRun(billingRun: BillingRun): Promise<string> {
    let result = await r.table("billingRuns")
      .insert(billingRun)
      .run(this.connection);

    let [ id ] = result.generated_keys;

    return id;
  }

  private createBillingForStudent(student: Student, fees: Fee[], month: string): Billing {
    let { grade } = student;
    let fee = fees.find(fee => fee.type === "class" && fee.id === grade.id);
    let amount = 0;
    let details = `Class Fees - ${fee.name} (${month})`;

    if (fee && fee.amount[student.paymentOption]) {
      amount = fee.amount[student.paymentOption];
    }

    return {
      accountId: student.id,
      grade: student.grade.id,
      student: {
        firstName: student.firstName,
        lastName: student.lastName
      },
      details,
      amount
    };
  }

  private isValidPaymentOption(paymentOptions: PaymentOption[]) {
    return (student: Student) => paymentOptions.indexOf(student.paymentOption) !== -1;
  }
  
}
