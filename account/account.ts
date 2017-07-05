
import { EventEnvelope } from "../common/event-envelope";
import { Requester, Responder } from "../common";

/*interface StudentAccountCreated {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  balance: number;
}

async function start() {
  try{
    let connection = await amqp.connect("amqp://localhost");
    let channel = await connection.createChannel();

    const queueName = "eventStore.client." + uuid();

    let q = await channel.assertQueue(queueName, { exclusive: true });

    for (let i = 0; i < 10; i++) {

      let id = uuid();
      let correlationId = uuid();
      
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

      console.log(" [x] Requesting event...", event);

      channel.consume(q.queue, (message) => {
        if (message.properties.correlationId === correlationId) {
          console.log(" [.] Got %s", message.content.toString());
        }
      }, { noAck: true });
    
      channel.sendToQueue("eventStore",
        new Buffer(JSON.stringify(event)),
        { correlationId: correlationId, replyTo: q.queue });
    }
    
  } catch (err) {
    console.error(err);
  }
}

start();*/















