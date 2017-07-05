import * as amqp from "amqplib";
import { Collection, Cursor, Db, MongoClient } from "mongodb";

import { EventEnvelope } from "../common/event-envelope";

class EventStore {

  constructor(private collection: Collection) {
  }

  async save(eventEnvelope: EventEnvelope): Promise<void> {
    await this.collection.insert(eventEnvelope);
  }

  loadByAggregateId(aggregateId: string): Promise<EventEnvelope[]> {
    return this.collection
      .find({ aggregateId: aggregateId })
      .sort({ timestamp: 1 })
      .toArray();
  }

  loadForAggregateType(aggregateType: string): Promise<EventEnvelope[]> {
    return this.collection
      .find({ aggregateType: aggregateType })
      .toArray();
  }

  loadEventCusor(): Cursor<EventEnvelope> {
    return this.collection.find({});
  }

}

async function startEventStore(): Promise<EventStore> {  
  let db: Db = await MongoClient.connect("mongodb://localhost/rlds");
  let eventsCollection: Collection = db.collection("events");
  
  await eventsCollection.createIndex({ aggregateId: 1 });
  await eventsCollection.createIndex({ aggregateName: 1 });

  return new EventStore(eventsCollection);
}

const queueName = "eventStore";

async function createChannel() {
  let connection: amqp.Connection = await amqp.connect("amqp://localhost");
  let channel: amqp.Channel = await connection.createChannel();
  
  await channel.assertQueue(queueName, { durable: false });
  await channel.prefetch(1);

  return channel;
}

async function start() {
  try{
    const eventStore = await startEventStore();
    const channel = await createChannel();
    
    console.log(" [x] Awaiting RPC requests");

    channel.consume(queueName, (message: amqp.Message) => {
      let eventEnvelope: EventEnvelope = JSON.parse(message.content.toString());

      console.log(" [.] storing event...", eventEnvelope);

      eventStore
        .save(eventEnvelope)
        .then(() => {
          channel.sendToQueue(message.properties.replyTo,
            new Buffer("Ok"),
            { correlationId: message.properties.correlationId });

          channel.ack(message);
        });
    });
  } catch (err) {
    console.error(err);
  }
}

start();