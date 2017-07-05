
import { Consumer } from "../common";

const consumer: Consumer = new Consumer({
  name: "Random Producer",
  exchangeName: "events",
  queueName: "eventQueue"
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onMessage(data, done: () => void) {
  console.log("start receiving");
  await sleep(2000);
  console.log("done!", data);
  done();
}

consumer
  .receive(onMessage)
  .then(() => console.log("start receive"));