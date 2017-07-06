import * as express from "express";
import * as bodyParser from "body-parser";
import * as uuid from "uuid/v4";

import { Requester, Responder } from "../common";
import { EventEnvelope } from "../eventstore/event-envelope";
import { StudentAccountCreated } from "./account";

const app = express();

const eventStoreRequester = new Requester({
  name: "Event Store",
  sendTo: "eventStore"
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/account", (req, res) => {
  let data: StudentAccountCreated = req.body;
  let id = uuid();

  data.id = id;
  data.balance = 0;

  let event: EventEnvelope = {
    aggregateId: id,
    aggregateType: "studentAccount",
    eventName: "created",
    timestamp: new Date(),
    data: data
  };

  eventStoreRequester
    .send({ type: "", data: event })
    .then(() => res.json({ id: id }))
    .catch((err) => res.status(500).send(err));
});

app.listen(3000, () => {
  console.log("server listening on port 3000...");
});