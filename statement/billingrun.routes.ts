import { Router, Response } from "express";
import * as r from "rethinkdb";

import { RethinkRequest } from "./data-access";

import { Fee } from "./fee.model";
import { Student, PaymentOption } from "./student.model";
import { Billing, BillingRun, BillingRunStatus } from "./billingrun.model";
import { Transaction } from "./transaction.models";

import { getFees } from "./fee.service";

export const billingRunRouter = Router();

const getStudents = async (connection): Promise<Student[]> => {
  let cursor = await r.table("students")
    .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
    .run(connection);
  
  return cursor.toArray();
}

const getBillingRun = (id: string, connection): Promise<BillingRun> => {
  return r.table("billingRuns")
    .get<BillingRun>(id)
    .run(connection);
}

const createBillingForStudent = (student: Student, details: string, amount: number): Billing => {
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

type BillingRequest = {
  month: string;
  date: string | Date;
  paymentOptions: PaymentOption[];
};

billingRunRouter.get("/:id", async (req: RethinkRequest, res: Response) => {
  let { id } = req.params;
  let billingRun = await getBillingRun(id, req.rdb);
  
  res.json(billingRun);
});

billingRunRouter.post("/:id", async (req: RethinkRequest, res: Response) => {
  let { id } = req.params as { id: string };
  let { status } = req.body as { status: BillingRunStatus };
  
  let billingRun = await getBillingRun(id, req.rdb);

  if (!billingRun) {
    return res.sendStatus(404);
  }

  if (status !== BillingRunStatus.Completed) {
    return res.sendStatus(400);
  }

  let txs = billingRun.billings.map(billing => {
    let tx: Transaction = {
      date: billingRun.date,
      debit: billing.amount,
      details: billing.details,
      accountId: billing.accountId
    };

    return tx;
  });

  await r.table("transactions")
    .insert(txs)
    .run(req.rdb);

  await r.table("billingRuns")
    .get(id)
    .update({ status: BillingRunStatus.Completed })
    .run(req.rdb);

  res.sendStatus(200);
});

billingRunRouter.post("/", async (req: RethinkRequest, res: Response) => {
  let { month, date, paymentOptions } = req.body as BillingRequest;
  paymentOptions = paymentOptions || [];

  let fees = await getFees(req.rdb);
  let students = await getStudents(req.rdb);
  
  let billings: Billing[] = [];

  students.forEach(student => {
    if (paymentOptions.indexOf(student.paymentOption) === -1) {
      return;
    }

    let { grade } = student;
    let fee = fees.find(fee => fee.type === "class" && fee.id === grade.id);
    let amount = 0;
    let details = `Class Fees - ${fee.name} (${month})`;

    if (fee && fee.amount[student.paymentOption]) {
      amount = fee.amount[student.paymentOption];
    }

    let billing = createBillingForStudent(student, details, amount);
    billings.push(billing);
  });
  
  let billingRun: BillingRun = {
    date: new Date(date),
    status: BillingRunStatus.Pending,
    billings
  };

  let result = await r.table("billingRuns")
    .insert(billingRun)
    .run(req.rdb);

  console.log(result);

  res.json(billingRun);
});
