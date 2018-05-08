import * as express from "express";
import * as http from "http";

import { Server } from "./server";
import { router } from "./router";

let httpPort = normalizePort(process.env.PORT || 3000);

let app = Server.bootstrap().app;
app.set("port", httpPort);

router.load(app, "./controllers");

let httpServer = http.createServer(app);

// listen on port(s)
httpServer.listen(httpPort);

// error handler
httpServer.on("error", onError);

// start listening
httpServer.on("listening", onListening);

function normalizePort(value: any): string | number {
  let port = parseInt(value, 10);

  if (isNaN(port)) {
    // named pipe
    return value;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  throw new Error("Invalid port specified");
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof httpPort === "string"
    ? "Pipe " + httpPort
    : "Port " + httpPort;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;

    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;

    default:
      throw error;
  }
}

function onListening() {
  let address = httpServer.address();
  let bind = typeof address === "string"
    ? "Pipe " + address
    : "Port " + address.port;

  console.log("Listening on " + bind);
}
