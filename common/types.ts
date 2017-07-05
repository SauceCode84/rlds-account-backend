
export interface RequestMessage {
  type: string;
  correlationId?: string;
  data: any;
}

export interface ResponseMessage {
  data: any;
}

export type ResponseCallback = (err: Error, response?: ResponseMessage) => void;
