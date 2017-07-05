import * as amqp from "amqplib";
import * as uuid from "uuid/v4";

export class Consumer {

  private name: string;
  private exchangeName: string;
  private queueName: string;

  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor({ name, exchangeName, queueName }: { name: string, exchangeName: string, queueName: string }) {
    this.name = name;
    this.exchangeName = exchangeName;
    this.queueName = queueName;
  }

  public async receive(callback: (data: any, done: () => void) => void) {
    if (!this.connection || !this.channel) {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();
    }

    await this.channel.assertQueue(this.queueName, { durable: false });
    await this.channel.bindQueue(this.queueName, this.exchangeName, "");
    
    this.channel.prefetch(1);

    this.channel.consume(this.queueName, (message) => {
      let data = JSON.parse(message.content.toString());
      
      callback(data, () => this.channel.ack(message));
    }, { noAck: false })
  }

}
