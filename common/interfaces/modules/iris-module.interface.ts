import { MiddlewaresConsumer } from "../middlewares/middlewares-consumer.interface";

export interface IrisModule {
  configure?: (consumer: MiddlewaresConsumer) => MiddlewaresConsumer | void;
}
