import * as express from "express";
import * as bodyParser from "body-parser";
import * as uuid from "uuid/v4";

import { EventEnvelope } from "../common/event-envelope";
import { Requester, Responder } from "../common";

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

interface StudentAccountCreated {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  balance: number;
}

/*async function start() {
  const eventStoreRequester = new Requester({
    name: "Event Store",
    sendTo: "eventStore"
  });
  
  //let tasks: Promise<{}>[] = [];

  for (let i = 0; i < 10; i++) {
    let id = uuid();
    
    let event: EventEnvelope = {
      aggregateId: id,
      aggregateType: "studentAccount",
      eventName: "created",
      timestamp: new Date(),
      data: <StudentAccountCreated>{
        id: id,
        firstName: "Jim",
        lastName: "Bob",
        grade: "Grade 1",
        balance: 0.0
      }
    };

    try {
      
      let result = await eventStoreRequester.send({ type: "", data: event });
      
      //tasks.push(eventStoreRequester.send({ type: "", data: event }));

    } catch (err) {
      console.warn(err.stack);
      console.warn(err.stackAtStateChange);
    }
  }

  ///*console.time("send events");
  //await Promise.all(tasks);
  //console.timeEnd("send events");
}

start();*/















