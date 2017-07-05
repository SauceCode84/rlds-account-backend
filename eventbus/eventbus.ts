import * as amqp from "amqplib";

//let connection: amqp.Connection;

async function createConnection() {
  function onConnectionError(err: Error) {
    if (err.message !== "Connection closing") {
      console.error("[AMQP] connection error", err.message);
    }
  }

  function onConnectionClose() {
    console.error("[AMQP] reconnecting");
    setTimeout(start, 1000);
  }

  let connection = await amqp.connect("amqp://localhost?heartbeat=60");

  connection
    .on("error", onConnectionError)
    .on("close", onConnectionClose);

  return connection;
}

async function start() {
  try {
    await createConnection();
    console.log("[AMQP] connected");

    //await init();
  } catch (err) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
  }
}

start();