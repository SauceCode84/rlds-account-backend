import * as r from "rethinkdb";
import { onConnect } from "./data-access";

export class AccountService {

  constructor(private connection: r.Connection) { }

}
