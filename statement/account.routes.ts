import { Request, Response, Router, NextFunction } from "express";

import {
  readAccounts, ReadAccounts,
  readAccountNames, ReadAccountNames,
  readAccountBalances, ReadAccountBalances,
  readAccountById, ReadAccountById,
  readSubAccountsForAccount, ReadSubAccountsForAccount,
  createAccount, CreateAccount,
  updateAccount, UpdateAccount
} from "./accounts";

export const accountsRouter = Router();

const makeGetAccounts = (readAccounts: ReadAccounts) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    let accounts = await readAccounts(req.query);

    res.json(accounts);
  } catch (err) {
    console.error(err);
    next(err);
  }
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

const makeGetSubAccountsForAccount =
  (readSubAccountsForAccount: ReadSubAccountsForAccount) =>
    async (req: Request, res: Response) => {
      let { id } = req.params;
      let subAccounts = await readSubAccountsForAccount(id);

      res.json(subAccounts);
    };

const makePostAccount =
  (createAccount: CreateAccount) =>
    async (req: Request, res: Response) => {
      await createAccount(req.body);

      res.sendStatus(200);
    }

const makePutAccount = 
  (updateAccount: UpdateAccount) =>
    async (req: Request, res: Response) => {
      let { id } = req.params;

      await updateAccount(id, req.body);

      res.sendStatus(200);
    };

const getAccounts = makeGetAccounts(readAccounts);
const getAccountNames = makeGetAccountNames(readAccountNames);
const getAccountBalances = makeGetAccountBalances(readAccountBalances);
const getAccountById = makeGetAccountById(readAccountById);
const getSubAccountsForAccount = makeGetSubAccountsForAccount(readSubAccountsForAccount);

const postAccount = makePostAccount(createAccount);

const putAccount = makePutAccount(updateAccount);

accountsRouter
  .get("/", getAccounts)
  .get("/names", getAccountNames)
  .get("/balances", getAccountBalances)
  .get("/:id", getAccountById)
  .get("/:id/subAccounts", getSubAccountsForAccount)
  .post("/", postAccount)
  .put("/:id", putAccount);
