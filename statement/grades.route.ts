import { Request, Response, Router } from "express";

import * as r from "rethinkdb";
import { RethinkRequest } from "./data-access";

const getGrades = async (req: RethinkRequest, res: Response) => {
  let result = await r.table("grades")
    .orderBy("sortOrder")
    .run(req.rdb);
  
  let grades = await result.toArray();

  res.json(grades);
}

export const gradesRouter = Router();

gradesRouter.get("/", getGrades);
