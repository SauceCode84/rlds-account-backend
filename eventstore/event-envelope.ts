
export interface EventEnvelope {
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  timestamp: Date;
  data: any;
}

export const createEventEnvelope = <TEvent>(aggregateId: string, aggregateType: string, eventName: string, eventData: TEvent): EventEnvelope => {
  return {
    aggregateId: aggregateId,
    aggregateType: aggregateType,
    eventName: eventName,
    timestamp: new Date(),
    data: eventData
  };
}
