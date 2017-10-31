import { NextFunction, Response, Router } from "express";
import { RethinkRequest } from "./data-access";

import { getFees, getFeesByType, getFee, isFeeType } from "./fee.service";

export const feesRouter = Router();

// GET by fee type
feesRouter.get("/", async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { type } = req.query;

  if (!type) {
    return next();
  }

  if (!isFeeType(type)) {
    return res.status(400).send("Invalid fee type");
  }
  
  let fees = await getFeesByType(type, req.rdb);
  res.json(fees);
});

// GET all fees
feesRouter.get("/", async (req: RethinkRequest, res: Response) => {
  let fees = await getFees(req.rdb);

  res.json(fees);
});

// GET fee by id
feesRouter.get("/:id", async (req: RethinkRequest, res: Response) => {
  let { id } = req.params;
  let fee = await getFee(id, req.rdb);

  res.json(fee);
});
