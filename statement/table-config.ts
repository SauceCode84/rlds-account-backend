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
  seedOnCreate: boolean,
  seed?: string | ((connection: any) => void | Promise<void>);
}

export const tableConfigs: TableConfig[] = [
  {
    name: "students",
    primaryKey: "id",
    indices: [
      {
        name: "gradeSort",
        options: r.row("grade")("sortOrder")
      }
    ],
    seedOnCreate: true,
    seed: "../../seed-data/students.json"
  },
  {
    name: "users",
    primaryKey: "id",
    seedOnCreate: false
  }
];
