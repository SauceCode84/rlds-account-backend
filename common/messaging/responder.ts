import * as amqp from "amqplib";

import { RequestMessage } from "./";

interface ResponderRequestMessage {
  data: any;
}

type ResponderCallback = (returnValue: any) => void;

interface ResponderOptions {
  name: string;
  queueName: string;
  respondsTo?: string[];
}

export class Responder {

  private name: string;
  private queueName: string;
  private respondsTo: string[];

  private connection: amqp.Connection;

  constructor({ name, queueName, respondsTo }: ResponderOptions) {
    this.name = name;
    this.queueName = queueName;
    this.respondsTo = respondsTo || [];
  }

  private async createChannel() {
    if (!this.connection) {
      this.connection = await amqp.connect("amqp://localhost");
    }
    
    let channel: amqp.Channel = await this.connection.createChannel();
    let result = await channel.assertQueue(this.queueName, { durable: false });

    await channel.prefetch(1);

    return channel;    
  }

  public on(type: string, callback: (request: ResponderRequestMessage, returnCallback: ResponderCallback) => void): void;
  public on(type: string, callback: (request: ResponderRequestMessage) => Promise<any>): void;

  public on(type: string, callback: (request: ResponderRequestMessage, returnCallback?: ResponderCallback) => void | Promise<any>): void {
    this.createChannel()
        .then((channel) => {
          channel.consume(this.queueName, (message: amqp.Message) => {
            let request = { data: JSON.parse(message.content.toString()) };

            const returnToSender = (returnValue: any) => {
              channel.sendToQueue(message.properties.replyTo,
                new Buffer(JSON.stringify(returnValue)),
                { correlationId: message.properties.correlationId });
              channel.ack(message);
            };

            let returnCallback: ResponderCallback = (returnValue: any) => returnToSender(returnValue);            
            let result = callback(request, returnCallback);

            if (result && typeof result.then === "function") {
              result.then((returnValue) => returnToSender(returnValue));
            }
        });
      });
  }
}
