
import { Observable, Observer, Subject } from "rxjs";
import { Collection, Cursor, Db, MongoClient, MongoError } from "mongodb";
import * as uuid from "uuid/v4";
import * as redis from "redis";

import "./array.groupBy";

class EventStore {

  constructor(private collection: Collection) {
  }

  async save(eventEnvelope: EventEnvelope): Promise<void> {
    await this.collection.insert(eventEnvelope);
  }

  loadByAggregateId(aggregateId: string): Promise<EventEnvelope[]> {
    return this.collection
      .find({ aggregateId: aggregateId })
      .sort({ timestamp: 1 })
      .toArray();
  }

  loadForAggregateType(aggregateType: string): Promise<EventEnvelope[]> {
    return this.collection
      .find({ aggregateType: aggregateType })
      .toArray();
  }

  loadEventCusor(): Cursor<EventEnvelope> {
    return this.collection.find({});
  }

}

const createEventEnvelope = <TEvent>(aggregateId: string, aggregateType: string, eventName: string, eventData: TEvent): EventEnvelope => {
  return {
    aggregateId: aggregateId,
    aggregateType: aggregateType,
    eventName: eventName,
    timestamp: new Date(),
    data: eventData
  };
}


class EventBus {

  private eventSubject: Subject<EventEnvelope> = new Subject<EventEnvelope>();

  constructor(private eventStore: EventStore) {
  }

  async push<TEvent>(eventEnvelope: EventEnvelope) {
    await this.eventStore.save(eventEnvelope);
    this.eventSubject.next(eventEnvelope);  
  }

  get eventStream() {
    return this.eventSubject.asObservable();
  }

  loadEventStore() {
    this.eventStore
      .loadEventCusor()
      .forEach((eventEnvelope: EventEnvelope) => {
        this.eventSubject.next(eventEnvelope);
      },
      (err: MongoError) => {
        if (err) {
          this.eventSubject.error(err);
        }
      });
  }

  eventStreamFor(aggregateType: string) {
    return this.eventStream
      .filter((event) => event.aggregateType === aggregateType);
  }

}

interface EventEnvelope {
  aggregateId: string;
  aggregateType: string;
  eventName: string;
  timestamp: Date;
  data: any;
}

interface StudentAccountCreated {
  id: string;
  firstName: string;
  lastName: string;
  grade: StudentGrade;
  balance: number;
}

interface StudentAccountEmailAdded {
  email: string;
}

interface StudentAccountDebited {
  date: Date;
  details: string;
  amount: number;
}

interface StudentAccountCredited {
  date: Date;
  details: string;
  amount: number;
}

type StudentAccountEvent =
  StudentAccountCreated |
  StudentAccountEmailAdded |
  StudentAccountDebited |
  StudentAccountCredited;

interface AccountLine {
  date: Date;
  details: string;
  debit?: number;
  credit?: number;
}

interface Product {

}

type StudentGrade = "Primary" | "Grade 1";

class StudentAccount {

  id: string;
  firstName: string;
  lastName: string;
  grade: StudentGrade;
  balance: number;
  emails: string[] = [];
  lines: AccountLine[] = [];

  static async create(firstName: string, lastName: string, grade: StudentGrade) {
    let id = uuid();
    let studentAccount = new StudentAccount(id);
    
    if (firstName || lastName) {
      await studentAccount.apply("created", <StudentAccountCreated>{
        id: id,
        firstName: firstName,
        lastName: lastName,
        grade: grade
      });
    }

    return studentAccount;
  }

  constructor(id?: string) {
    this.id = id;
  }

  loadFromEvents(events: EventEnvelope[]) {
    events.reduce(handleStudentAccountEvent, this);
  }

  private async apply(eventName: string, event: StudentAccountEvent, isNew: boolean = true) {
    let eventEnvelope = createEventEnvelope(this.id, "studentAccount", eventName, event);
    
    handleStudentAccountEvent(this, eventEnvelope);
    await eventBus.push(eventEnvelope);
  }
  
  async addEmail(email: string) {
    await this.apply("emailAdded", <StudentAccountEmailAdded>{
      email
    });
  }

  async debited(date: Date, details: string, amount: number) {
    await this.apply("debited", <StudentAccountDebited>{
      date,
      details,
      amount
    });
  }

  async credit(date: Date, details: string, amount: number) {
    await this.apply("credited", <StudentAccountCredited>{
      date: date,
      details: details,
      amount: amount
    });
  }

}

class StudentAccountRepo {

  private redisClient: redis.RedisClient;
  //private studentAccounts: Map<string, StudentAccount> = new Map();

  constructor(private eventStore: EventStore) {
    this.redisClient = redis.createClient(6379);
  }

  private clear(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.redisClient.flushdb((err, result) => {
        resolve();
      });
    });
  }

  async load() {
    await this.clear();

    let events = await this.eventStore.loadForAggregateType("studentAccount");

    events
      .groupBy(e => e.aggregateId)
      .forEach((events, aggregateId) => {
        let studentAccount = new StudentAccount();
      
        studentAccount.loadFromEvents(events);
      
        //this.studentAccounts[aggregateId] = studentAccount;
        this.redisClient.set(aggregateId, JSON.stringify(studentAccount));
      });
  }

  getById(id: string): Promise<StudentAccount> {
    return new Promise<StudentAccount>((resolve, reject) => {
      this.redisClient.get(id, (err: Error, data: string) => {
        if (err) {
          return reject(err);
        }

        let studentAccount: StudentAccount = JSON.parse(data);

        resolve(studentAccount);
      });
    });
    
    //return this.studentAccounts[id];
  }

}



const handleStudentAccountEvent = (studentAccount: StudentAccount, event: EventEnvelope): StudentAccount => {
  let handler = studentAccountEventHandlers[event.eventName];
  handler(studentAccount, event.data);

  return studentAccount;
}

/*const subcribeToEvents = (studentAccount: StudentAccount) => {
  studentAccountEventStream.subscribe(event => handleStudentAccountEvent(studentAccount, event));
}*/

type StudentAccountEventHandler = (studentAccount: StudentAccount, event: StudentAccountEvent) => void;

const studentAccountEventHandlers: { [eventName: string]: StudentAccountEventHandler } = {
  
  created: (studentAccount: StudentAccount, event: StudentAccountCreated) => {
    studentAccount.id = event.id;
    studentAccount.firstName = event.firstName;
    studentAccount.lastName = event.lastName;
    studentAccount.grade = event.grade;
    studentAccount.balance = event.balance || 0;
  },
  
  emailAdded: (studentAccount: StudentAccount, event: StudentAccountEmailAdded) => {
    studentAccount.emails.push(event.email);
  },

  debited: (studentAccount: StudentAccount, event: StudentAccountDebited) => {
    studentAccount.lines.push({
      date: event.date,
      details: event.details,
      debit: event.amount
    });
    studentAccount.balance += event.amount;
  },
  
  credited: (studentAccount: StudentAccount, event: StudentAccountCredited) => {
    studentAccount.lines.push({
      date: event.date,
      details: event.details,
      credit: event.amount
    });
    studentAccount.balance -= event.amount;
  }

}

//const eventBus = new EventBus();

async function startEventStore(): Promise<EventStore> {  
  let db: Db = await MongoClient.connect("mongodb://localhost/rlds");
  let eventsCollection: Collection = db.collection("events");
  
  await eventsCollection.createIndex({ aggregateId: 1 });
  await eventsCollection.createIndex({ aggregateName: 1 });

  return new EventStore(eventsCollection);
}

let eventStore: EventStore;
let eventBus: EventBus;
let studentAccountEventStream: Observable<EventEnvelope>;

const init = async () => {
  eventStore = await startEventStore();
  eventBus = new EventBus(eventStore);
  studentAccountEventStream = eventBus.eventStreamFor("studentAccount");

  let repo = new StudentAccountRepo(eventStore);

  //console.time("load repo");
  //await repo.load();
  //console.timeEnd("load repo");

  /*let studentAccount;

  console.time("load student account");
  studentAccount = await repo.getById("018247a1-bba7-4e84-8fc5-4124466b61bf");
  console.timeEnd("load student account");
  console.log(studentAccount);
  
  console.time("load student account");
  studentAccount = await repo.getById("fff32f32-f91b-464f-aed9-4e2aa565b986");
  console.timeEnd("load student account");
  console.log(studentAccount);

  console.time("load student account");
  studentAccount = await repo.getById("f7000b98-b7af-4fb5-bb85-e0b5f43b0efb");
  console.timeEnd("load student account");
  console.log(studentAccount);*/

  //eventBus.loadEventStore();

  //studentAccountEventStream.subscribe(console.log);

  console.time("populate student events");

  let promises: Promise<void>[] = [];

  for (let i = 0; i < 10000; i++) {
    promises.push(populateStudentAccountEvents());
  }

  await Promise.all(promises);

  console.timeEnd("populate student events");
  
  console.log("Done!");
  //console.log(studentAccount);
};

async function populateStudentAccountEvents() {
  let studentAccount = await StudentAccount.create("Jim", "Bob", "Primary");
  await studentAccount.addEmail("me@work.net");
  await studentAccount.addEmail("you@work.net");

  await studentAccount.debited(new Date("2017-01-14"), "Registration Fees", 250);
  await studentAccount.debited(new Date("2017-01-14"), "Class Fees (Jan)", 500);
  await studentAccount.credit(new Date(), "Payment Received", 100);
}

init();
/*
type QueryHandler<TQuery, TResult> = (query: TQuery) => TResult;

type ValueSelector<T, TValue> = (item: T) => TValue;
type RulePredicate<T> = (value: T) => boolean;

const greaterThan = <T>(value: T) => (item: T) => item > value;

const isValidRegex = (regex: RegExp) => (value: string) => regex.test(value);

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isValidEmail = isValidRegex(emailRegex);

var parseSsn = /^\d{3}-\d{2}-\d{4}$/.exec;

const validAge = greaterThan(18);
const isNotEmptyString = (value: string): boolean => {
  return value !== null && value !== undefined && value.length > 0;
};

const contains = <T>(predicate: (value: T) => boolean) => {
  return (items: T[]) => {
    return items.findIndex(predicate) !== 0;
  }
}

const validateRule = <T>(value: T, rulePredicate: RulePredicate<T>) => {
  return rulePredicate(value);
}

const validateRuleFor = <T, TKey>(item: T, valueSelector: ValueSelector<T, TKey>, rulePredicate: RulePredicate<TKey>) => {
  return validateRule(valueSelector(item), rulePredicate);
}

const validate = (studentAccount: StudentAccount) => {
  const ruleFor = <TValue>(valueSelector: ValueSelector<StudentAccount, TValue>, rulePredicate: RulePredicate<TValue>) => {
    return validateRuleFor(studentAccount, valueSelector, rulePredicate);
  };

  ruleFor(s => s.firstName, isNotEmptyString);
  ruleFor(s => s.lastName, greaterThan(""));
  ruleFor(s => s.lines, contains((l: AccountLine) => l.date > new Date()))

  return validateRuleFor(studentAccount, s => s.firstName, isNotEmptyString);
}

interface RuleForValue<T, TValue> {
  valueSelector: ValueSelector<T, TValue>;
  rulePredicate: RulePredicate<TValue>;
  errorMessage: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class Validator<T> {

  private rules: RuleForValue<T, any>[] = [];
  
  validateFor<TValue>(valueSelector: ValueSelector<T, TValue>, rulePredicate: RulePredicate<TValue>, errorMessage?: string) {
    this.rules.push({
      valueSelector: valueSelector,
      rulePredicate: rulePredicate,
      errorMessage: errorMessage
    });

    return this;
  }

  validate(item: T): ValidationResult {
    return this.rules.reduce((validationResult: ValidationResult, rule) => {
      let value = rule.valueSelector(item);
      let result = validateRule(value, rule.rulePredicate);

      if (!result) {
        validationResult.isValid = false;
        
        let errorMessage = rule.errorMessage || this.genericErrorMessage(value, rule);
        validationResult.errors.push(errorMessage);
      }

      return validationResult;
    }, { isValid: true, errors: [] });
  }

  private genericErrorMessage(value: any, rule: RuleForValue<T, any>): string {
    return `Value for '(${ rule.valueSelector }) = ${ value }' failed for rule '${ rule.rulePredicate.name || rule.rulePredicate }'`;
  }

}

let v = new Validator<StudentAccount>()
  .validateFor(s => s.firstName, isNotEmptyString, "First Name cannot be empty")
  .validateFor(s => s.lastName, isNotEmptyString);
  //.validateFor(s => s.email, isValidEmail, "Invalid email");

let studentAccount = new StudentAccount();
//studentAccount.email = "me@worknet";

let result = v.validate(studentAccount);

console.log(result);*/

//const r = (valueSelector: ValueSelector<T, TKey>, rulePredicate: RulePredicate<TKey>)


