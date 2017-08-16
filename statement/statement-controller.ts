
import { NextFunction, Request, Response, Router, RequestHandler } from "express";

import { Controller } from "./controller.decorator";
import { Get } from "./request-mapping.decorators";

import { Statement } from "./statement.schema";
import { RouteMapper } from "./route-mapper";

@Controller()
export class StatementController {
  
  public static create(router: Router) {
    router.get("/statement", (req, res, next) => {
      new StatementController().all(req, res, next);
    });
  }

  @Get("/")
  public async all(req: Request, res: Response, next: NextFunction) {
    let statements = await Statement.find({}).populate("student");
    res.status(200).json(statements);
  }

  @Get("/:id")
  public async getById(req: Request, res: Response, next: NextFunction) {
    
  }

}

let result = new RouteMapper().explore(new StatementController());
console.log("result", result);