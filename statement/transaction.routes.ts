import { NextFunction, Response, Router } from "express";

import * as r from "rethinkdb";
import { getConnection } from "./data-access";

import { ServiceRequest } from "./service-request";
import { TransactionService } from "./transaction.service";
import { responseFinishHandler } from "./response-finish-handler";
import { serviceRequestProvider } from "./serviceRequestProvider";

export const transactionRouter = Router();

type TransactionServiceRequest = ServiceRequest<TransactionService>;

const getAccountTransactions = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let { accountId, includeSubAccounts } = req.query;

  if (!accountId) {
    return next();
  }

  let txs = await req.service.getTransactionsByAccount(accountId, includeSubAccounts);

  res.json(txs);
}

const getAllTransactions = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let txs = await req.service.getAllTransactions();
  
  res.json(txs);
}

const getTransaction = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  let tx = await req.service.getTransaction(id);

  if (!tx) {
    return res.sendStatus(404);
  }

  res.json(tx);
}

const postTransaction = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let id = await req.service.insertTransaction(req.body);

  res.status(201).json({ id });
}

const putTransaction = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  await req.service.updateTransaction(id, req.body);

  res.sendStatus(200);
}

const postDoubleEntryTransaction = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let result = await req.service.postDoubleEntry(req.body);

  res.json(result);
}

transactionRouter
  .use(serviceRequestProvider(connection => new TransactionService(connection)))
  .get("/", getAccountTransactions, getAllTransactions)
  .get("/:id", getTransaction)
  .post("/", postTransaction)
  .put("/:id", putTransaction)
  .post("/post", postDoubleEntryTransaction);
