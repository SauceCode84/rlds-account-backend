import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as express from "express";
import * as methodOverride from "method-override";
import * as logger from "morgan";

import { StudentController } from "./student-controller";
import { StatementController } from "./statement-controller";

export class Server {

  public app: express.Application;

  public static bootstrap(): Server {
    return new Server();
  }

  constructor() {
    this.app = express();

    // load config
    this.config();

    // setup api routes
    this.api();
  }

  public config() {
    // logger
    this.app.use(logger("dev"));

    // json form parser
    this.app.use(bodyParser.json());

    // query string parser
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // override
    this.app.use(methodOverride());

    // catch 404 and forward to error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      err.status = 404;
      next(err);
    });

    // error handler
    this.app.use(errorHandler());
  }

  public api() {
    let router = express.Router();

    StudentController.create(router);
    StatementController.create(router);

    this.app.use("/", router);
  }

}
