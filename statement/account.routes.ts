import { Request, Response, Router } from "express";

import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";

import { AccountService } from "./account.service";

import { getConnection } from "./data-access";
import { readAccounts, ReadAccounts, readAccountNames, readAccountBalances } from "./accounts";
import { AccountFilterOptions } from "./accounts/accountFilterOptions";

export const accountsRouter = Router();

type AccountServiceRequest = ServiceRequest<AccountService>;

const makeGetAccounts = (readAccounts: ReadAccounts) => async (req: Request, res: Response) => {
  let accounts = await readAccounts(req.query);

  res.json(accounts);
}

const getAccounts = makeGetAccounts(readAccounts);

const getAccountNames = async (req: AccountServiceRequest, res: Response) => {
  let accountNames = await readAccountNames(req["rethinkConnection"])(req.query);

  res.json(accountNames);
};

const getAccountBalances = async (req: AccountServiceRequest, res: Response) => {
  let accountBalances = await readAccountBalances(req["rethinkConnection"])();

  res.json(accountBalances);
};

const getAccountById = async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;
  let account = await req.service.getAccount(id);

  res.json(account);
};

const getAccountSubAccounts = async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;

  let subAccounts = await req.service.getSubAccounts(id);

  res.json(subAccounts);
};

const postAccount = async (req: AccountServiceRequest, res: Response) => {
  await req.service.insertAccount(req.body);

  res.sendStatus(200);
};

const putAccount = async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;

  await req.service.updateAccount(id, req.body);

  res.sendStatus(200);
};

accountsRouter
  .use(async (req, res, next) => {
    let connection = await getConnection();
    req["rethinkConnection"] = connection;

    res.on("finish", async () => {
      await connection.close();
    });

    next();
  });

accountsRouter
  .use(serviceRequestProvider(connection => new AccountService(connection)));

accountsRouter
  .get("/", getAccounts)
  .get("/names", getAccountNames)
  .get("/balances", getAccountBalances)
  .get("/:id", getAccountById)
  .get("/:id/subAccounts", getAccountSubAccounts)
  .post("/", postAccount)
  .put("/:id", putAccount);