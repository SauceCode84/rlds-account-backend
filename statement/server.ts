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
import { IStudentModel, Grade } from "./student.model";
import { Student } from "./student.schema";
import { routerMethodFactory } from "./routerMethodFactory";

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

    // seed database, if need be
    //this.seed();
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

    // disable etag (caching)
    this.app.disable("etag");

    // allow cross domain
    this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
      res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

      next();
    });
  }

  private router: express.Router;

  public api() {
    this.router = express.Router();

    this.registerController(StudentController);
    this.registerController(StatementController);

    this.app.use("/", this.router);
  }

  private registerController<T>(controllerType: Type<T>, controllerFactory?: () => T) {
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

  public seed() {
    let students = [
      { firstName: "Hayley", lastName: "Hodnett", grade: Grade.PrePrimary },
      { firstName: "Lynne", lastName: "Coleman", grade: Grade.PrePrimary },
      { firstName: "Ciskia", lastName: "Smit", grade: Grade.PrePrimary },
      { firstName: "Ava", lastName: "Muller", grade: Grade.PrePrimary },
      { firstName: "Lindy", lastName: "du Preez", grade: Grade.Primary },
      { firstName: "Aila", lastName: "Smith", grade: Grade.Primary },
      { firstName: "Bulumko", lastName: "Mdaka", grade: Grade.Primary },
      { firstName: "Ndileka", lastName: "Thupudi", grade: Grade.Primary },
      { firstName: "Marunique", lastName: "Meyer", grade: Grade.Primary },
      { firstName: "Phenyo", lastName: "Toumane", grade: Grade.Primary },
      { firstName: "Kamogelo", lastName: "Sixpence", grade: Grade.Primary },
      { firstName: "Charmoné", lastName: "van den Berg", grade: Grade.Primary },
      { firstName: "Kgothatso", lastName: "Mathe", grade: Grade.Primary },
      { firstName: "Kate", lastName: "Bester", grade: Grade.Primary },
      { firstName: "Jerenique", lastName: "Griesel", grade: Grade.Primary },
      { firstName: "Ariel", lastName: "von Pickartz", grade: Grade.Primary },
      { firstName: "Ofentse", lastName: "Sibeko", grade: Grade.Primary },
      { firstName: "Madison", lastName: "Tonkin", grade: Grade.Grade1 },
      { firstName: "Jodie", lastName: "Alexander", grade: Grade.Grade1 },
      { firstName: "Janika", lastName: "Kluever", grade: Grade.Grade1 },
      { firstName: "Kaitlyn", lastName: "van Zyl", grade: Grade.Grade1 },
      { firstName: "Naledi", lastName: "Mtambeka", grade: Grade.Grade2 },
      { firstName: "Owethu", lastName: "Moyo", grade: Grade.Grade2 },
      { firstName: "Summer", lastName: "Poolman", grade: Grade.Grade2 },
      { firstName: "Busisiwe", lastName: "Sibeko", grade: Grade.Grade2 },
      { firstName: "Vicky", lastName: "du Preez", grade: Grade.Grade2 },
      { firstName: "Keleabetswe", lastName: "Diphoko", grade: Grade.Grade2 },
      { firstName: "Tiyamike", lastName: "Dickinson", grade: Grade.Grade2 },
      { firstName: "Keira", lastName: "Harris", grade: Grade.Grade2 },
      { firstName: "Catherine", lastName: "Alexander", grade: Grade.Grade3 },
      { firstName: "Andrea", lastName: "Hummerstone", grade: Grade.Grade3 },
      { firstName: "Casidy", lastName: "Webb", grade: Grade.Grade3 },
      { firstName: "Kaylan", lastName: "Webb", grade: Grade.Grade5 },
      { firstName: "Danielle", lastName: "Oosthuizen", grade: Grade.Grade5 },
      { firstName: "Tanna", lastName: "Goaté", grade: Grade.Grade5 },
      { firstName: "Kelci", lastName: "Walters", grade: Grade.Grade5 },
      { firstName: "Gabriella", lastName: "Colandrea", grade: Grade.Grade5 },
      { firstName: "Hannah", lastName: "Griffith", grade: Grade.Grade5 },
      { firstName: "Leischen", lastName: "le Roux", grade: Grade.Grade5 },
      { firstName: "Derachelle", lastName: "Venski", grade: Grade.Advanced1 }
    ];

    Student
      .insertMany(students)
      .then(result => console.log(`Inserted ${result.length} students...`));
  }

}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}
