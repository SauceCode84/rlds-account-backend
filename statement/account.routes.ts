import { Request, Response, Router } from "express";

import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";

import { AccountService } from "./account.service";
import { readAccounts, ReadAccounts, readAccountNames, ReadAccountNames, readAccountBalances, ReadAccountBalances, readAccountById, ReadAccountById } from "./accounts";

export const accountsRouter = Router();

type AccountServiceRequest = ServiceRequest<AccountService>;

const makeGetAccounts = (readAccounts: ReadAccounts) => async (req: Request, res: Response) => {
  let accounts = await readAccounts(req.query);

  res.json(accounts);
}

const makeGetAccountNames = (readAccountNames: ReadAccountNames) => async (req: Request, res: Response) => {
  let accountNames = await readAccountNames(req.query);
  
  res.json(accountNames);
};

const makeGetAccountBalances = (readAccountBalances: ReadAccountBalances) => async (req: Request, res: Response) => {
  let accountBalances = await readAccountBalances();

  res.json(accountBalances);
};

const makeGetAccountById = (readAccountById: ReadAccountById) => async (req: Request, res: Response) => {
  let { id } = req.params;
  let account = await readAccountById(id);

  res.json(account);
};

const getAccounts = makeGetAccounts(readAccounts);
const getAccountNames = makeGetAccountNames(readAccountNames);
const getAccountBalances = makeGetAccountBalances(readAccountBalances);
const getAccountById = makeGetAccountById(readAccountById);

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