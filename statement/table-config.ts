import * as r from "rethinkdb";
import * as fs from "fs";

export interface IndexConfig {
  name: string;
  options: any;
}

export interface TableConfig {
  name: string;
  primaryKey?: string;
  indices?: IndexConfig[];
  seed?: string | ((connection: any) => void | Promise<void>);
}

export const tableConfigs: TableConfig[] = [
  {
    name: "users",
    primaryKey: "id"
  },
  {
    name: "grades",
    seed: "../../seed-data/grades.json"
  },
  {
    name: "fees",
    seed: "../../seed-data/fees.json"
  },
  {
    name: "students",
    primaryKey: "id",
    indices: [
      {
        name: "gradeSort",
        options: r.row("grade")("sortOrder")
      }
    ],
    seed: "../../seed-data/students.json"
  },
  {
    name: "contacts",
    seed: "../../seed-data/contacts.json"
  },
  {
    name: "accounts",
    seed: "../../seed-data/accounts.json"
  },
  {
    name: "transactions",
    seed: "../../seed-data/transactions.json"
  }
];

/*

distinct class fees query

r.db("rlds")
.table("fees")
.map(doc => r.object(doc("type"), true)) // return { <type>: true }
.reduce((left, right) => left.merge(right))
.keys() // return all the keys of the final document

*/