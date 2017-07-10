import * as amqp from "amqplib";

export class Publisher {

  private name: string;
  private exchangeName: string;

  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor({ name, exchangeName }: { name: string, exchangeName: string }) {
    this.name = name;
    this.exchangeName = exchangeName;
  }

  public async publish(data: any) {
    if (!this.connection || !this.channel) {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();
    }

    await this.channel.assertExchange(this.exchangeName, "fanout", { durable: true });

    this.channel.publish(this.exchangeName, "", new Buffer(JSON.stringify(data)));
  }

}