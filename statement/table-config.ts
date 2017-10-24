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
    name: "grades",
    seed: "../../seed-data/grades.json"
  },
  {
    name: "fees",
    seed: "../../seed-data/fees.json"
  }
];
