
import { Requester, ResponseMessage } from "../common";

const randomRequester: Requester = new Requester({
  name: "Random Requester",
  sendTo: "eventStore",
  requests: ["randomRequest"]
});

function createRequest() {
  return {
    type: "randomRequest",
    data: {
      value: Math.floor(Math.random() * 100),
      timestamp: Date.now()
    }
  };
}

function onResponse(err: Error, response: ResponseMessage) {
  console.log(response.data);
}

setInterval(() => {
  randomRequester.send(createRequest(), onResponse);
}, 10);


//randomRequester.send(createRequest(), onResponse);


/*randomRequester
  .send(request)
  .then(response => {

  });*/