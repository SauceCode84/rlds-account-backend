import { NextFunction, Response, Router } from "express";
import { getConnection } from "./data-access";

import { FeeService } from "./fee.service";
import { ServiceRequest } from "./service-request";

export const feesRouter = Router();

type FeeServiceRequest = ServiceRequest<FeeService>;

feesRouter
  .use(async (req: FeeServiceRequest, res: Response, next: NextFunction) => {
    const connection = await getConnection();
    req.service = new FeeService(connection);

    next();
  });

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
