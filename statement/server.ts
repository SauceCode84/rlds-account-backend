import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as express from "express";
import * as methodOverride from "method-override";
import * as logger from "morgan";

import { StudentController } from "./student-controller";
import { StatementController } from "./statement-controller";
import { PATH_METADATA } from "./constants";
import { RoutePathScanner } from "./route-path-scanner";
import { isNil, isFunction } from "./util";

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

  private router: express.Router;

  public api() {
    this.router = express.Router();

    this.registerController(StudentController);
    this.registerController(StatementController);

    this.app.use("/", this.router);
  }

  registerController<T>(controllerType: Type<T>, controllerFactory?: () => T) {
    let controllerPath: string = Reflect.getMetadata(PATH_METADATA, controllerType);
    
    let controller: T = !isNil(controllerFactory) && isFunction(controllerFactory)
      ? controllerFactory()
      : new controllerType();

    let routePaths = new RoutePathScanner().scanPaths(controller);

    routePaths.forEach(routePath => {
      let { path, requestMethod, targetCallback } = routePath;
      let completePath = controllerPath + path;
      
      let routerMethod = routerMethodFactory(this.router, requestMethod).bind(this.router);
      
      routerMethod(completePath, targetCallback);
    });
  }

}

const routerMethodFactory = (target, requestMethod: string): Function => {
  switch (requestMethod) {
    case "POST":
      return target.post;

    default:
      return target.get;
  }
};

export interface Type<T> extends Function {
  new (...args: any[]): T;
}
