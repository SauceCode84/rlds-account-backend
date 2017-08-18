import * as amqp from "amqplib";
import * as uuid from "uuid/v4";

import { RequestMessage, ResponseCallback, ResponseMessage } from "./";

/** Requestor options */
interface RequesterOptions {
  /** The name of the Requestor */
  name: string;

  /** The name of the queue to which the requests are being sent */
  sendTo: string;

  /** An array of requests this Requester supports */
  requests?: string[];
}

/**
 * A Requester that sends requests to the specified queue and awaits a reponse
 */
export class Requester {
  
  private name: string;
  private sendTo: string;
  private requests: string[];

  private connection: amqp.Connection;
  
  /**
   * Creates a new Requester, with the options provided
   * @param {RequesterOptions} options Options for configuring the Requester
   */
  constructor({ name, sendTo, requests }: RequesterOptions) {
    this.name = name;
    this.sendTo = sendTo;
    this.requests = requests;
  }

  /**
   * Sends a request message to the requester's queue and returns a Promise containing the RepsonseMessage
   * @param {RequestMessage} request The request message to be sent
   * @returns {Promise<ResponseMessage>} 
   */
  public send(request: RequestMessage): Promise<ResponseMessage>;
  
  /**
   * Callback for returning a response from a request message
   * @callback responseCallback
   * @param {Error} err An error, if the request failed
   * @param {ResponseMessage} response The response return by the request
   */

  /**
   * Sends a request message to the requester's queue and and passes the response to the callback provided
   * @param {RequestMessage} request The request message to be sent
   * @param {responseCallback} callback The callback to which the response is returned
   */
  public send(request: RequestMessage, callback: ResponseCallback): void;

  public send(request: RequestMessage, callback?: ResponseCallback): void | Promise<ResponseMessage> {
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

  private async createChannel() {
    if (!this.connection) {
      this.connection = await amqp.connect("amqp://localhost");
    }

    let channel = await this.connection.createChannel();

    return channel;
  }

  private async sendAsync(request: RequestMessage): Promise<ResponseMessage> {
    return new Promise<ResponseMessage>(async (resolve, reject) => {
      let channel = await this.createChannel();

      let queueName = this.sendTo + ".client." + uuid();
      let correlationId = request.correlationId || uuid();
    
      await channel.assertQueue(queueName, { exclusive: true, autoDelete: true });  

      function onMessage(message: amqp.Message) {
        if (message.properties.correlationId === correlationId) {
          resolve({ data: JSON.parse(message.content.toString()) });
        } else {
          reject(new Error("CorrelationIds do not match!"));
        }
        
        channel.close();
      }

      channel.consume(queueName, onMessage, { noAck: true });

      channel.sendToQueue(this.sendTo,
        new Buffer(JSON.stringify(request.data)),
        { correlationId: correlationId, replyTo: queueName });
    });
  }
}

