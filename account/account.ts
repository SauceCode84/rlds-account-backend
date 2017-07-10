import * as uuid from "uuid/v4";

import { EventEnvelope, createEventEnvelope } from "../eventstore/event-envelope";
import { eventBus } from "./event-bus";

export type StudentGrade = "Primary" | "Grade 1";

type StudentAccountEventName = "created" | "deactivated" | "emailAdded" | "debited" | "credited";

interface StudentAccountCreated {
  id: string;
  firstName: string;
  lastName: string;
  grade: StudentGrade;
  balance: number;
}

interface StudentAccountDeactivated {
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
  StudentAccountDeactivated |
  StudentAccountEmailAdded |
  StudentAccountDebited |
  StudentAccountCredited;

interface AccountLine {
  date: Date;
  details: string;
  debit?: number;
  credit?: number;
}

export class StudentAccount {

  id: string;
  firstName: string;
  lastName: string;
  grade: StudentGrade;
  balance: number;
  emails: string[] = [];
  lines: AccountLine[] = [];

  active: boolean = true;

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

  private async apply(eventName: StudentAccountEventName, event: StudentAccountEvent, isNew: boolean = true) {
    let eventEnvelope = createEventEnvelope(this.id, "studentAccount", eventName, event);
    
    handleStudentAccountEvent(this, eventEnvelope);
    await eventBus.send({ type: "", data: eventEnvelope });
  }
  
  async addEmail(email: string) {
    await this.apply("emailAdded", { email });
  }

  async deactivate() {
    await this.apply("deactivated", {});
  }

  async debited(date: Date, details: string, amount: number) {
    await this.apply("debited", <StudentAccountDebited>{ date, details, amount });
  }

  async credit(date: Date, details: string, amount: number) {
    await this.apply("credited", <StudentAccountCredited>{ date, details, amount});
  }

}

const handleStudentAccountEvent = (studentAccount: StudentAccount, event: EventEnvelope): StudentAccount => {
  let handler = studentAccountEventHandlers[event.eventName];
  handler(studentAccount, event.data);

  return studentAccount;
}

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
  },

  deactivated: (studentAccount: StudentAccount, event: StudentAccountDeactivated) => {
    studentAccount.active = false;
  }

}
