/*import * as express from "express";
import * as bodyParser from "body-parser";
import * as uuid from "uuid/v4";

import { Student } from "./student.schema";
import { Statement } from "./statement.schema";
import { IStudentModel } from "./student.model";

import "../array.flatMap";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/statement", async (req: express.Request, res: express.Response) => {
  let statements = await Statement.find({}).populate("student");

  //let result = statements.flatMap(value => value.lines);
  
  res.status(200).json(statements);
});

app.listen(3000, () => {
  console.log("server listening on port 3000...");
});

let student = new Student({
  firstName: "Jimmy",
  lastName: "Bob"
});

student.save();

/*const flatMap = <T, U>(selectorFn: (t: T) => U[], array: T[]): U[] => {
  return array.reduce((prev: U[], value: T) => {
    return prev.concat(selectorFn(value));
  }, []);
};*/
  

/*let student = new Student({
  firstName: "Andrea",
  lastName: "Hummerstone"
});

let statement = new Statement({
  lines: [
    {
      date: new Date("2017-01-03"),
      description: "Payment Received - Thank you!",
      credit: 930.00
    },
    {
      date: new Date("2017-01-10"),
      description: "Payment Received - Thank you!",
      credit: 250.00
    },
    {
      date: new Date("2017-01-14"),
      description: "Registration Fees - 2017",
      debit: 250.00
    },
    {
      date: new Date("2017-01-14"),
      description: "Class Fees Grade 3 (Jan)",
      debit: 410.00
    },
    {
      date: new Date("2017-01-14"),
      description: "Private Lessons - Half Hour (Jan)",
      debit: 520.00
    },
    {
      date: new Date("2017-01-24"),
      description: "Body Conditioning Equipment",
      debit: 320.00
    }
  ]
});

async function run() {
  let newStudent = await student.save();
  console.log(newStudent);
  
  statement.student = newStudent;
  
  let newStatement = await statement.save();
  console.log(newStatement);
}

run();

/*
let statement = new Statement({
  lines: [{
    date: new Date("2017-01-03"),
    description: "Payment Received - Thank you!",
    credit: 930.00
  },
  {
    date: new Date("2017-01-10"),
    description: "Payment Received - Thank you!",
    credit: 250.00
  },
  {
    date: new Date("2017-01-14"),
    description: "Registration Fees - 2017",
    debit: 250.00
  },
  {
    date: new Date("2017-01-14"),
    description: "Class Fees Grade 3 (Jan)",
    debit: 410.00
  },
  {
    date: new Date("2017-01-14"),
    description: "Private Lessons - Half Hour (Jan)",
    debit: 520.00
  },
  {
    date: new Date("2017-01-24"),
    description: "Body Conditioning Equipment",
    debit: 320.00
  },
  {
    date: new Date("2017-01-26"),
    description: "Class Fees Grade 3 (Feb)",
    debit: 410.00
  },
  {
    date: new Date("2017-01-26"),
    description: "Private Lessons - Half Hour (Feb)",
    debit: 520.00
  },
  {
    date: new Date("2017-02-02"),
    description: "Payment Received - Thank You!",
    credit: 320.00
  },
  {
    date: new Date("2017-02-02"),
    description: "Payment Received - Thank You!",
    credit: 930.00
  },
  {
    date: new Date("2017-02-27"),
    description: "Class Fees Grade 3 (Mar)",
    debit: 410.00
  },
  {
    date: new Date("2017-02-27"),
    description: "Private Lessons - Half Hour (Mar)",
    debit: 520.00
  },
  {
    date: new Date("2017-03-02"),
    description: "Payment Received - Thank You!",
    credit: 930.00
  },
  {
    date: new Date("2017-03-22"),
    description: "Exam Fees - Grade 3 2017",
    debit: 626.00
  },
  {
    date: new Date("2017-03-23"),
    description: "Payment Received - Thank You!",
    credit: 626.00
  },
  {
    date: new Date("2017-03-27"),
    description: "Class Fees Grade 3 (Apr)",
    debit: 410.00
  },
  {
    date: new Date("2017-03-27"),
    description: "Private Lessons - Half Hour (Apr)",
    debit: 520.00
  },
  {
    date: new Date("2017-04-03"),
    description: "Payment Received - Thank You!",
    credit: 930.00
  },
  {
    date: new Date("2017-04-26"),
    description: "Class Fees Grade 3 (May)",
    debit: 410.00
  },
  {
    date: new Date("2017-04-26"),
    description: "Private Lessons - Half Hour (May)",
    debit: 520.00
  },
  {
    date: new Date("2017-05-02"),
    description: "Payment Received - Thank You!",
    credit: 930.00
  },
  {
    date: new Date("2017-05-25"),
    description: "Class Fees Grade 3 (Jun)",
    debit: 410.00
  },
  {
    date: new Date("2017-05-25"),
    description: "Private Lessons - Half Hour (Jun)",
    debit: 520.00
  },
  {
    date: new Date("2017-05-25"),
    description: "Piano Fees 2017",
    debit: 300.00
  }]
});

statement.save((err, result) => {
  if (err) {
    console.error(err);
  }

  console.log(result);
});
*/