import { Request, Response, Router } from "express";

import * as r from "rethinkdb";
import { getConnection } from "./data-access";
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from "constants";

export const configRouter = Router();

const getConfigData = async () => {
  const connection: r.Connection = await getConnection();
  const cursor = await r.table("config").without("id").run(connection);

  let [ value ] = await cursor.toArray();

  return value;
}

const getConfig = async (req: Request, res: Response) => {
  let config = await getConfigData();

  res.json(config);
}

configRouter
  .get("/", getConfig);
  