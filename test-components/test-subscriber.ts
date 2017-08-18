
import { Subscriber } from "../common/messaging";

const subscriber: Subscriber = new Subscriber({
  name: "Random Producer",
  exchangeName: "eventsPub"
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function onMessage(data) {
  console.log("start receiving");
  await sleep(2000);
  console.log("done!", data);
}

subscriber
  .subscribe((data) => {
    console.log("received...", data);
  });
