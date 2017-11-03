import { NextFunction, Response, Router } from "express";

import * as r from "rethinkdb";
import { getConnection } from "./data-access";

import { ServiceRequest } from "./service-request";
import { TransactionService } from "./transaction.service";
import { responseFinishHandler } from "./response-finish-handler";

export const transactionRouter = Router();

type TransactionServiceRequest = ServiceRequest<TransactionService>;

const serviceRequestHandler = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  const connection: r.Connection = await getConnection();
  const service: TransactionService = new TransactionService(connection);
  
  req.service = service;

  res.on("finish", responseFinishHandler(req));

  next();
}

const getAccountTransactions = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let { accountId } = req.query;

  if (!accountId) {
    return next();
  }

  let txs = await req.service.accountTransactions(accountId);

  res.json(txs);
}

const getAllTransactions = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let txs = await req.service.allTransactions();
  
  res.json(txs);
}

const postTransaction = async (req: TransactionServiceRequest, res: Response, next: NextFunction) => {
  let id = await req.service.insertTransaction(req.body);

  res.json({ id });
}

transactionRouter
  .use(serviceRequestHandler)
  .get("/", getAccountTransactions, getAllTransactions)
  .post("/", postTransaction);
