import { Request, Response, NextFunction } from "express";
import * as r from "rethinkdb";
import * as fs from "fs";

import { IndexConfig, tableConfigs } from "./table-config";

const connectionConfig = {
  host: "localhost",
  port: 28015,
  db: "rlds"
};

export interface RethinkRequest extends Request {
  rdb: r.Connection;
};

type OnConnectCallback = (err: Error, connection?: r.Connection) => void;

export const onConnect = (callback: OnConnectCallback) => {
  r.connect(connectionConfig)
   .then(connection => {
     r.db(connectionConfig.db)
      .wait()
      .run(connection, (err, result) => {
        if (err) {
          throw err;
        }

        callback(null, connection);
      });    
   })
   .catch(err => callback(err));
}

const createIndex = (tableName: string, indices: string[], connection: r.Connection) =>
  async (index: IndexConfig) => {
    let indexName = index.name;
  
    if (indices.indexOf(indexName) == -1) {
      await r.table(tableName).indexCreate(indexName, index.options).run(connection);
      console.log(`Created '${indexName}' index on '${tableName}' table...`);
    } else {
      console.log(`Index '${indexName}' on '${tableName}' already exists`);
    }
  }

const loadJSONAsync = <T extends any>(filename: string) => {
  return new Promise<T>((resolve, reject) => {
    fs.readFile(filename, "utf-8", (err, contents) => {
      if (err) {
        reject(err);
      }
      
      let result: T = JSON.parse(contents);

      resolve(result);
    });
  });
}

const seedFromFile = async (filename: string, tableName: string, connection: r.Connection) => {
  let data = await loadJSONAsync(filename);

  let result = await r.table(tableName)
    .insert(data)
    .run(connection);
  
  return result.inserted as number;
}

onConnect(async (err, connection) => {
  if (err) {
    return console.error(err);    
  }

  let tables: string[] = await r.tableList().run(connection);

  console.log("Tables in DB...", tables);

  tableConfigs.forEach(async tableConfig => {
    let tableName = tableConfig.name;
    let tableCreated = false;

    if (tables.indexOf(tableName) == -1) {
      let primaryKey = tableConfig.primaryKey || "id";

      await r.tableCreate(tableName, { primaryKey }).run(connection);

      console.log(`Created '${tableName}' table...`);
      tableCreated = true;
    } else {
      console.log(`Table '${tableName}' already exists`);
    }

    if (tableConfig.indices && tableConfig.indices.length > 0) {
      let indices: string[] = await r.table(tableName).indexList().run(connection);
      const createIndexFor = createIndex(tableName, indices, connection);

      let indexTasks: Promise<void>[] = [];

      tableConfig.indices.forEach(index => indexTasks.push(createIndexFor(index)));

      await Promise.all(indexTasks);
    }

    if (tableCreated && tableConfig.seed) {
      console.log(`Seeding data for '${tableName}'...`);
      
      if (typeof tableConfig.seed === "string") {
        let inserted = await seedFromFile(tableConfig.seed, tableName, connection);
        console.log(`Inserted ${inserted} document(s) for table '${tableName}'`);
      } else {
        await Promise.resolve(tableConfig.seed(connection));
      }
    }
  });
});

export const getConnection = (): Promise<r.Connection> => {
  return r.connect(connectionConfig);
}

export const connect = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let count = 0;

  const _connect = async () => {
    try {
      const connection = await r.connect(connectionConfig);

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