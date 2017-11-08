import { NextFunction, Response, Router } from "express";

import { FeeService } from "./fee.service";
import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";
import { FeeType } from "./fee.model";

export const feesRouter = Router();

type FeeServiceRequest = ServiceRequest<FeeService>;

feesRouter
  .use(serviceRequestProvider(connection => new FeeService(connection)));

type FeeRequestQuery = { includeAccountName?: boolean, type?: FeeType };

// GET all fees
feesRouter.get("/", async (req: FeeServiceRequest, res: Response) => {
  let { includeAccountName, type } = req.query as FeeRequestQuery;

  if (type && !FeeService.isFeeType(type)) {
    return res.status(400).send("Invalid fee type");
  }

  let fees = await req.service.getFees({ includeAccountName, type });

  res.json(fees);
});

// GET fee by id
feesRouter.get("/:id", async (req: FeeServiceRequest, res: Response) => {
  let { id } = req.params;
  let fee = await req.service.getFee(id);

  res.json(fee);
});

feesRouter.put("/:id", async (req: FeeServiceRequest, res: Response) => {
  let { id } = req.params;
  
  await req.service.updateFee(id, req.body);

  res.sendStatus(200);
})
