
/*import { NextFunction, Request, Response, Router, RequestHandler } from "express";

import { Controller } from "./controller.decorator";
import { Get } from "./request-mapping.decorators";

import { Statement } from "./statement.schema";

@Controller("/student")
export class StatementController {
  
  @Get("/:id/statement")
  public async getStudentStatement(req: Request, res: Response, next: NextFunction) {
    let statements = await Statement.find({}).populate("student");
    res.status(200).json(statements);
  }

  @Get("/:id")
  public async getById(req: Request, res: Response, next: NextFunction) {
    
  }

}*/
