import * as express from "express";
import * as bodyParser from "body-parser";
import * as uuid from "uuid/v4";

import { Requester, Responder } from "../common/messaging";
import { EventEnvelope } from "../eventstore/event-envelope";
import { StudentAccount } from "./account";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/account", (req, res) => {
  let { firstName, lastName, grade } = req.body;

  StudentAccount
    .create(firstName, lastName, grade)
    .then((studentAccount) => res.json({ id: studentAccount.id }))
    .catch((err) => res.status(500).send(err));
});

app.listen(3000, () => {
  console.log("server listening on port 3000...");
});