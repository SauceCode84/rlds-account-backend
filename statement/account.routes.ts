import { Router, Response } from "express";

import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";

import { AccountService } from "./account.service";

export const accountsRouter = Router();

type AccountServiceRequest = ServiceRequest<AccountService>;

const getAccounts = async (req: AccountServiceRequest, res: Response) => {
  let accounts = await req.service.getAccounts(req.query);

  res.json(accounts);
};

const getAccountNames = async (req: AccountServiceRequest, res: Response) => {
  let accountNames = await req.service.getAccountNames(req.query);

  res.json(accountNames);
};

const getAccountBalances = async (req: AccountServiceRequest, res: Response) => {
  let accountBalances = await req.service.getAccountBalances();

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
  .use(serviceRequestProvider(connection => new AccountService(connection)));

accountsRouter
  .get("/", getAccounts)
  .get("/names", getAccountNames)
  .get("/balances", getAccountBalances)
  .get("/:id", getAccountById)
  .get("/:id/subAccounts", getAccountSubAccounts)
  .post("/", postAccount)
  .put("/:id", putAccount);