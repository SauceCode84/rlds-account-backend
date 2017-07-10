import { MiddlewaresConsumer } from "./";

export interface MiddlewareConfigProxy {
  with: (...data) => MiddlewareConfigProxy;
  forRoutes: (...routes) => MiddlewaresConsumer;
}
