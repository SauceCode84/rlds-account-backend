
import { Requester } from "../common";

export const eventBus = new Requester({
  name: "Event Store",
  sendTo: "eventStore"
});
