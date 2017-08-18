
import { Publisher } from "../common/messaging";

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

  console.log("publisher send...", data);
}, 1000);
