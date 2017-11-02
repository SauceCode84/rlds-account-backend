import { Request, Response, Router } from "express";

import * as r from "rethinkdb";
import { getConnection } from "./data-access";

interface Grade {
  id: string;
  name: string;
  sortOrder: number;
}

const getGrades = async (req: Request, res: Response) => {
  let connection: r.Connection = await getConnection();
  let result = await r.table("grades")
    .orderBy("sortOrder")
    .run(connection);
  
  let grades = await result.toArray<Grade>();

  res.json(grades);
}

export const gradesRouter = Router();

gradesRouter.get("/", getGrades);
