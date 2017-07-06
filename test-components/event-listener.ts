
import { Subscriber } from "../common";

const subscriber: Subscriber = new Subscriber({
  name: "Events Listener",
  exchangeName: "eventStream"
});

subscriber
  .subscribe((data) => {
    console.log("received...", data);
  });
