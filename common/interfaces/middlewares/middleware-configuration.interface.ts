import { Controller, ControllerMetadata } from "../controllers";
import { RequestMethod } from "../../enums";

export interface MiddlewareConfiguration {
  middlewares: any;
  forRoutes: (Controller | ControllerMetadata & { method?: RequestMethod })[];
}
