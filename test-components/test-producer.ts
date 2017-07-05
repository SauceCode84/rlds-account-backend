
import { Producer } from "../common";

const producer: Producer = new Producer({
  name: "Random Producer",
  exchangeName: "events",
});

setInterval(async () => {
  let data = {
    greeting: "hello world!",
    value: Math.floor(Math.random() * 100),
    timestamp: Date.now()
  };

  await producer.send(data);

  console.log("producer send...", data);
}, 1000);
