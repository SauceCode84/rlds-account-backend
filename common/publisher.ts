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

  public publish(data: any) {

  }

}