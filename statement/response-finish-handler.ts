
import { Request } from "express";
import { OnResponseFinish } from "./on-response-finish";

export const responseFinishHandler = (req: Request) => async () => {
  if (!req) {
    return;
  }

  let service = req["service"];

  if (!service || !(service as OnResponseFinish).finish) {
    return;
  }

  await Promise.resolve((service as OnResponseFinish).finish());
}
