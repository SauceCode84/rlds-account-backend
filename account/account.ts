import * as uuid from "uuid/v4";

import { EventEnvelope } from "../common/event-envelope";
import { Requester, Responder } from "../common";

interface StudentAccountCreated {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  balance: number;
}

async function start() {
  const eventStoreRequester = new Requester({
    name: "Event Store",
    sendTo: "eventStore"
  });
  
  let tasks: Promise<{}>[] = [];

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
      //console.log("sending to eventStore...", event);
      //let result = await eventStoreRequester.send({ type: "", data: event });
      //console.log("done! result...", result);

      tasks.push(eventStoreRequester.send({ type: "", data: event }));
    } catch (err) {
      console.warn(err.stack);
      console.warn(err.stackAtStateChange);
    }
  }

  console.time("send events");
  await Promise.all(tasks);
  console.timeEnd("send events");
}

start();















