
import { Responder } from "../common/messaging";

const responder: Responder = new Responder({
  name: "Random Responder",
  queueName: "eventStore",
  respondsTo: ["randomRequest"]
});

/*responder.on("randomRequest", (request, returnCallback) => {
  let value = request.value;

  console.log("responder.randomRequest... value", value);

  returnCallback(value);
});*/

function echoRequest<T>(value: T): Promise<T> {
  console.log("responder.randomRequest Promise... value", value);
  return Promise.resolve(value);
}

responder.on("randomRequest", (request) => echoRequest(request.data));