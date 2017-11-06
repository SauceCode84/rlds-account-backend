import { NextFunction, Response, Router } from "express";

import { FeeService } from "./fee.service";
import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";

export const feesRouter = Router();

type FeeServiceRequest = ServiceRequest<FeeService>;

feesRouter
  .use(serviceRequestProvider(connection => new FeeService(connection)));

// GET by fee type
feesRouter.get("/", async (req: FeeServiceRequest, res: Response, next: NextFunction) => {
  let { type } = req.query;

  if (!type) {
    return next();
  }

  if (!FeeService.isFeeType(type)) {
    return res.status(400).send("Invalid fee type");
  }
  
  let fees = await req.service.getFeesByType(type);
  res.json(fees);
});

// GET all fees
feesRouter.get("/", async (req: FeeServiceRequest, res: Response) => {
  let fees = await req.service.getFees();

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
