import { Router, Response } from "express";
import * as r from "rethinkdb";

import { PaymentOption } from "./student.model";
import { BillingRunStatus } from "./billingrun.model";

import { ServiceRequest } from "./service-request";
import { BillingRunService } from "./billingrun.service";
import { serviceRequestProvider } from "./serviceRequestProvider";

type BillingRunServiceRequest = ServiceRequest<BillingRunService>;

export const billingRunRouter = Router();

billingRunRouter
  .use(serviceRequestProvider(connection => new BillingRunService(connection)));

type BillingRequest = {
  month: string;
  date: Date;
  paymentOptions: PaymentOption[];
};

billingRunRouter.get("/:id", async (req: BillingRunServiceRequest, res: Response) => {
  let { id } = req.params;
  let billingRun = await req.service.getBillingRun(id);
  
  res.json(billingRun);
});

billingRunRouter.put("/:id", async (req: BillingRunServiceRequest, res: Response) => {
  let { id } = req.params as { id: string };
  let exists = await req.service.billingRunExists(id);

  if (!exists) {
    return res.sendStatus(404);
  }

  let { status } = req.body as { status: BillingRunStatus };
  
  if (status !== BillingRunStatus.Completed) {
    return res.status(400).send("Invalid status");
  }
  
  await req.service.completeBillingRun(id);
  
  res.sendStatus(200);
});

billingRunRouter.post("/", async (req: BillingRunServiceRequest, res: Response) => {
  let { month, date, paymentOptions } = req.body as BillingRequest;
  paymentOptions = paymentOptions || [];

  let id = await req.service.createBillingRun(month, date, paymentOptions);

  res.json({ id });
});
