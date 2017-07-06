
import { Publisher } from "../common";

const publisher: Publisher = new Publisher({
  name: "Random Producer",
  exchangeName: "eventsPub",
});

setInterval(async () => {
  let data = {
    greeting: "hello world!",
    value: Math.floor(Math.random() * 100),
    timestamp: Date.now()
  };

  await publisher.publish(data);

  console.log("producer send...", data);
}, 1000);
