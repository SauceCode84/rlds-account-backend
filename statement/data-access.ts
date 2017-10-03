import { Request, Response, NextFunction } from "express";
import * as r from "rethinkdb";

const connectionConfig = {
  host: "localhost",
  port: 28015,
  db: "rlds"
};

export interface RethinkDb {
  rdb: any;
}

export const connect = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
  let count = 0;

  const _connect = async () => {
    try {
      console.log("Connecting to RethinkDb...");
      const connection = await r.connect(connectionConfig);

      console.log("Connected to RethinkDb!");

      req.rdb = connection;
      next();
    } catch (err) {
      console.error(err);
  
      count++;
      
      if (err.name === "ReqlDriverError" &&
          err.message.indexOf("Could not connect") === 0 &&
          count < 31) {
        setTimeout(_connect, 1000);
        return;
      }
    }
  };

  await _connect();
};