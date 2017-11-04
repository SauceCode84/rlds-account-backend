import { Response, NextFunction } from "express";
import * as r from "rethinkdb";

import { ServiceRequest } from "./service-request";
import { getConnection } from "./data-access";
import { responseFinishHandler } from "./response-finish-handler";

export const serviceRequestProvider = <TService>(provideFn: (connection: r.Connection) => TService) => {
  return async (req: ServiceRequest<TService>, res: Response, next: NextFunction) => {
    const connection = await getConnection();
    
    // create the service using the provider function
    req.service = provideFn(connection);
    // set the response handler to close the connection on finish
    res.on("finish", responseFinishHandler(req));

    next();
  }
}