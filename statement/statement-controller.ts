
import { NextFunction, Request, Response, Router } from "express";

import { Statement } from "./statement.schema";

export class StatementController {
  
    public static create(router: Router) {
      router.get("/statement", (req, res, next) => {
        new StatementController().all(req, res, next);
      });
    }
  
    public async all(req: Request, res: Response, next: NextFunction) {
      let statements = await Statement.find({}).populate("student");
      res.status(200).json(statements);
    }
  
  }
