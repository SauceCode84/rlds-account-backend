import * as amqp from "amqplib";
import * as uuid from "uuid/v4";

export class Subscriber {

  private name: string;
  private exchangeName: string;
  
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor({ name, exchangeName }: { name: string, exchangeName: string }) {
    this.name = name;
    this.exchangeName = exchangeName;
  }

  public async subscribe(callback: (data: any) => void) {
    if (!this.connection || !this.channel) {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();
    }

    let queueName = this.exchangeName + "." + uuid();

    await this.channel.assertQueue(queueName, { exclusive: true });
    await this.channel.bindQueue(queueName, this.exchangeName, "");

    this.channel.consume(queueName, (message) => {
      let data = JSON.parse(message.content.toString());

      callback(data);
    }, { noAck: true });
  }
}