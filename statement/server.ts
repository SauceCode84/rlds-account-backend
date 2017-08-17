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
import { IStudentModel } from "./student.model";
import { Student } from "./student.schema";

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
      { firstName: "Hayley", lastName: "Hodnett", grade: "Pre-primary "},
      { firstName: "Lynne", lastName: "Coleman", grade: "Pre-primary "},
      { firstName: "Ciskia", lastName: "Smit", grade: "Pre-primary "},
      { firstName: "Ava", lastName: "Muller", grade: "Pre-primary "},
      { firstName: "Lindy", lastName: "du Preez", grade: "Primary"},
      { firstName: "Aila", lastName: "Smith", grade: "Primary"},
      { firstName: "Bulumko", lastName: "Mdaka", grade: "Primary"},
      { firstName: "Ndileka", lastName: "Thupudi", grade: "Primary"},
      { firstName: "Marunique", lastName: "Meyer", grade: "Primary"},
      { firstName: "Phenyo", lastName: "Toumane", grade: "Primary"},
      { firstName: "Kamogelo", lastName: "Sixpence", grade: "Primary"},
      { firstName: "Charmoné", lastName: "van den Berg", grade: "Primary"},
      { firstName: "Kgothatso", lastName: "Mathe", grade: "Primary"},
      { firstName: "Kate", lastName: "Bester", grade: "Primary"},
      { firstName: "Jerenique", lastName: "Griesel", grade: "Primary"},
      { firstName: "Ariel", lastName: "von Pickartz", grade: "Primary"},
      { firstName: "Ofentse", lastName: "Sibeko", grade: "Primary"},
      { firstName: "Madison", lastName: "Tonkin", grade: "Grade 1"},
      { firstName: "Jodie", lastName: "Alexander", grade: "Grade 1"},
      { firstName: "Janika", lastName: "Kluever", grade: "Grade 1"},
      { firstName: "Kaitlyn", lastName: "van Zyl", grade: "Grade 1"},
      { firstName: "Naledi", lastName: "Mtambeka", grade: "Grade 2"},
      { firstName: "Owethu", lastName: "Moyo", grade: "Grade 2"},
      { firstName: "Summer", lastName: "Poolman", grade: "Grade 2"},
      { firstName: "Busisiwe", lastName: "Sibeko", grade: "Grade 2"},
      { firstName: "Vicky", lastName: "du Preez", grade: "Grade 2"},
      { firstName: "Keleabetswe", lastName: "Diphoko", grade: "Grade 2"},
      { firstName: "Tiyamike", lastName: "Dickinson", grade: "Grade 2"},
      { firstName: "Keira", lastName: "Harris", grade: "Grade 2"},
      { firstName: "Catherine", lastName: "Alexander", grade: "Grade 3"},
      { firstName: "Andrea", lastName: "Hummerstone", grade: "Grade 3"},
      { firstName: "Casidy", lastName: "Webb", grade: "Grade 3"},
      { firstName: "Kaylan", lastName: "Webb", grade: "Grade 5"},
      { firstName: "Danielle", lastName: "Oosthuizen", grade: "Grade 5"},
      { firstName: "Tanna", lastName: "Goaté", grade: "Grade 5"},
      { firstName: "Kelci", lastName: "Walters", grade: "Grade 5"},
      { firstName: "Gabriella", lastName: "Colandrea", grade: "Grade 5"},
      { firstName: "Hannah", lastName: "Griffith", grade: "Grade 5"},
      { firstName: "Leischen", lastName: "le Roux", grade: "Grade 5"},
      { firstName: "Derachelle", lastName: "Venski", grade: "Advanced 1"}
    ];

    Student
      .insertMany(students)
      .then(result => console.log(`Inserted ${result.length} students...`));
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
