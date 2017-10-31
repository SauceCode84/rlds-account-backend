import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as express from "express";
import * as methodOverride from "method-override";
import * as logger from "morgan";

import * as dataAccess from "./data-access";

import { PATH_METADATA } from "./constants";
import { RoutePathScanner } from "./route-path-scanner";
import { isNil, isFunction } from "./util";

import { routerMethodFactory } from "./routerMethodFactory";

import { studentRouter } from "./student-controller";
import { gradesRouter } from "./grades.route";
import * as auth from "./auth";
import { feesRouter } from "./fee.routes";
import { authRouter } from "./auth.route";
import { userRouter } from "./user.route";
import { billingRunRouter } from "./billingrun.routes";

import "./transaction.changefeed";

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
    //this.seedStudents();
    //this.seedAccounts();
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

    this.app.use(auth.initialize());

    // setup data access
    this.app.use(dataAccess.connect);

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
    this.app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization");

      next();
    });
  }

  private router: express.Router;

  public api() {
    this.router = express.Router();

    this.app.use("/", authRouter);
    this.app.use("/", userRouter);
    this.app.use("/grades", gradesRouter);
    this.app.use("/fees", feesRouter);
    this.app.use("/students", studentRouter);
    this.app.use("/billingRun", billingRunRouter);

    //this.registerController(StudentController);
    //this.registerController(StatementController);

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

  /*public seedStudents() {
    let students = [
      { firstName: "Hayley", lastName: "Hodnett", grade: Grade.PrePrimary, paymentOption: PaymentOption.Monthly },
      { firstName: "Lynne", lastName: "Coleman", grade: Grade.PrePrimary, paymentOption: PaymentOption.Monthly },
      { firstName: "Ciskia", lastName: "Smit", grade: Grade.PrePrimary, paymentOption: PaymentOption.Monthly },
      { firstName: "Ava", lastName: "Muller", grade: Grade.PrePrimary, paymentOption: PaymentOption.Monthly },
      { firstName: "Lindy", lastName: "du Preez", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Aila", lastName: "Smith", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Bulumko", lastName: "Mdaka", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Ndileka", lastName: "Thupudi", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Marunique", lastName: "Meyer", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Phenyo", lastName: "Toumane", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Kamogelo", lastName: "Sixpence", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Charmoné", lastName: "van den Berg", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Kgothatso", lastName: "Mathe", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Kate", lastName: "Bester", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Jerenique", lastName: "Griesel", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Ariel", lastName: "von Pickartz", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Ofentse", lastName: "Sibeko", grade: Grade.Primary, paymentOption: PaymentOption.Monthly },
      { firstName: "Madison", lastName: "Tonkin", grade: Grade.Grade1, paymentOption: PaymentOption.Monthly },
      { firstName: "Jodie", lastName: "Alexander", grade: Grade.Grade1, paymentOption: PaymentOption.Monthly },
      { firstName: "Janika", lastName: "Kluever", grade: Grade.Grade1, paymentOption: PaymentOption.Monthly },
      { firstName: "Kaitlyn", lastName: "van Zyl", grade: Grade.Grade1, paymentOption: PaymentOption.Monthly },
      { firstName: "Naledi", lastName: "Mtambeka", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Owethu", lastName: "Moyo", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Summer", lastName: "Poolman", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Busisiwe", lastName: "Sibeko", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Vicky", lastName: "du Preez", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Keleabetswe", lastName: "Diphoko", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Tiyamike", lastName: "Dickinson", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Keira", lastName: "Harris", grade: Grade.Grade2, paymentOption: PaymentOption.Monthly },
      { firstName: "Catherine", lastName: "Alexander", grade: Grade.Grade3, paymentOption: PaymentOption.Monthly },
      { firstName: "Andrea", lastName: "Hummerstone", grade: Grade.Grade3, paymentOption: PaymentOption.Monthly },
      { firstName: "Casidy", lastName: "Webb", grade: Grade.Grade3, paymentOption: PaymentOption.Monthly },
      { firstName: "Kaylan", lastName: "Webb", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Danielle", lastName: "Oosthuizen", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Tanna", lastName: "Goaté", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Kelci", lastName: "Walters", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Gabriella", lastName: "Colandrea", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Hannah", lastName: "Griffith", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Leischen", lastName: "le Roux", grade: Grade.Grade5, paymentOption: PaymentOption.Monthly },
      { firstName: "Derachelle", lastName: "Venski", grade: Grade.Advanced1, paymentOption: PaymentOption.Monthly }
    ];

    Student
      .insertMany(students)
      .then(result => console.log(`Inserted ${result.length} students...`));
  }

  public seedAccounts() {
    let accountsReceiveable = new Account({
      name: "Accounts Receivable",
      type: AccountType.Asset
    });
    
    accountsReceiveable.subAccounts.push(new Account({ name: "Stduent 1", type: AccountType.Asset }));
    accountsReceiveable.subAccounts.push(new Account({ name: "Stduent 2", type: AccountType.Asset }));

    let accounts = [
      {
        name: "Cash",
        type: AccountType.Asset,
        lines: [
          { date: new Date(), description: "Payment from ...", debit: 100 },
          { date: new Date(), description: "Payment from ...", debit: 250 }
        ]
      },
      accountsReceiveable
    ];

    Account
      .insertMany(accounts)
      .then(result => console.log(`Inserted ${result.length} accounts...`));
  }*/

}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}
