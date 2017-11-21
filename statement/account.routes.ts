import { Router, Response } from "express";

import { ServiceRequest } from "./service-request";
import { serviceRequestProvider } from "./serviceRequestProvider";

import { AccountService } from "./account.service";

export const accountsRouter = Router();

type AccountServiceRequest = ServiceRequest<AccountService>;

accountsRouter
  .use(serviceRequestProvider(connection => new AccountService(connection)));

accountsRouter.get("/", async (req: AccountServiceRequest, res: Response) => {
  let { type } = req.query;
  let accounts = await req.service.getAccounts({ type });

  res.json(accounts);
});

accountsRouter.get("/names", async (req: AccountServiceRequest, res: Response) => {
  let { type } = req.query;
  let accountNames = await req.service.getAccountNames({ type });

  res.json(accountNames);
});

accountsRouter.get("/:id", async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;

  let account = await req.service.getAccount(id);

  res.json(account);
});

accountsRouter.get("/:id/subAccounts", async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;

  let subAccounts = await req.service.getSubAccounts(id);

  res.json(subAccounts);
})

accountsRouter.post("/", async (req: AccountServiceRequest, res: Response) => {
  await req.service.insertAccount(req.body);

  res.sendStatus(200);
});

accountsRouter.put("/:id", async (req: AccountServiceRequest, res: Response) => {
  let { id } = req.params;

  await req.service.updateAccount(id, req.body);

  res.sendStatus(200);
});