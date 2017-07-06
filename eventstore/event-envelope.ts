
export interface EventEnvelope {
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  timestamp: Date;
  data: any;
}
