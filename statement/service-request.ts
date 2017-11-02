
import { Request } from "express";

export interface ServiceRequest<TService> extends Request {
  service: TService
}

export const isServiceRequest = <TService>(req: Request): req is ServiceRequest<TService> => {
  return req["service"] !== undefined || req["service"] !== null;
}
