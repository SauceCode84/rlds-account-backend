import * as amqp from "amqplib";
import * as uuid from "uuid/v4";

import { RequestMessage, ResponseCallback, ResponseMessage } from "./";

interface RequesterOptions {
  name: string;
  sendTo: string;
  requests: string[];
}

export class Requester {
  
  private name: string;
  private sendTo: string;
  private requests: string[];

  private connection: amqp.Connection;
  
  constructor({ name, sendTo, requests }: RequesterOptions) {
    this.name = name;
    this.sendTo = sendTo;
    this.requests = requests;
  }

  /**
   * Sends a request message to the requester's queue
   * @param request The request message to be sent
   */
  public send(request: RequestMessage): Promise<ResponseMessage>;
  public send(request: RequestMessage, callback: ResponseCallback): void;

  public send(request: RequestMessage, callback?: ResponseCallback) : void | Promise<ResponseMessage> {
    if (typeof callback === "function") {
      return this.sendCallback(request, callback);
    }

    return this.sendAsync(request);
  }

  private sendCallback(request: RequestMessage, callback: ResponseCallback) {
    this.sendAsync(request)
        .then((response: ResponseMessage) => callback(null, response))
        .catch((err: Error) => callback(err));
  }

  private async sendAsync(request: RequestMessage): Promise<ResponseMessage> {
    if (!this.connection) {
      this.connection = await amqp.connect("amqp://localhost");
    }

    let channel = await this.connection.createChannel();
    let queueName = this.sendTo + ".client." + uuid();
    
    await channel.assertQueue(queueName, { exclusive: true });

    return new Promise<ResponseMessage>((resolve, reject) => {
      let correlationId = request.correlationId || uuid();

      channel.consume(queueName, (message) => {
        if (message.properties.correlationId === correlationId) {
          resolve({ data: JSON.parse(message.content.toString()) });
          channel.close();
        }
      }, { noAck: true });

      channel.sendToQueue(this.sendTo,
        new Buffer(JSON.stringify(request.data)),
        { correlationId: correlationId, replyTo: queueName });
    });
  }
}
