
import { Requester } from "../common/messaging";

export const eventBus = new Requester({
  name: "Event Store",
  sendTo: "eventStore"
});
