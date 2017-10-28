import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response, Router } from "express";

import * as r from "rethinkdb";

import "../array.last";

import { onConnect, RethinkRequest } from "./data-access";
import { StatusError } from "./status.error";
import { PageOptions, PagedResults, paginateResults, validPageOptions, extractPagination } from "./pagination";
import { Change } from "./changefeed";

const statusErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof StatusError) {
    return res.status(err.statusCode).json(err.message);
  }

  next(err);
}

const studentCount = (connection: any): Promise<number> =>
  r.table("students").count().run(connection);

const findStudent = (id: string, connection: any): Promise<any> => {
  return r.table("students")
    .get(id)
    .without("contacts")
    .run(connection);
}

const studentExists = async (id: string, connection: any) => {
  let student = await r.table("students")
    .get(id)
    .run(connection);

  return student !== undefined && student !== null;
}

const paginationSliceParams = (options: PageOptions) => {
  let { page, pageSize } = options;
  
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;
  
  let pageStart: number = ((page - 1) * pageSize);
  let pageEnd: number = pageStart + pageSize;

  return { pageStart, pageEnd };
}

const pagedStudents = async (connection: any, { pageStart, pageEnd }) => {
  let cursor = await r.table("students")
    .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
    .slice(pageStart, pageEnd)
    .run(connection);

  return await cursor.toArray();
}

const getPagedStudents = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let pageOptions = extractPagination(req);

  if (!validPageOptions(pageOptions)) {
    return next();
  }

  try {
    let connection = req.rdb;
    let result = await paginateResults(
      () => pagedStudents(connection, paginationSliceParams(pageOptions)),
      () => studentCount(connection),
      pageOptions);
    
    res.json(result);
  } catch (err) {
    next(err);
  }
}

const getStudents = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  try {
    let cursor = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      .run(req.rdb);
    let students = await cursor.toArray();

    res.json(students);
  } catch (err) {
    next(err);
  }
}

const getStudentNames = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  try {
    let cursor = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      .pluck("id", "firstName", "lastName", "grade")
      .run(req.rdb);
    let students = await cursor.toArray();
  
    res.json(students);
  } catch (err) {
    next(err);
  }
}

const getStudentById = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  
  try {
    let student = await findStudent(id, req.rdb);

    if (!student) {
      return res.sendStatus(404);
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
}

const defaultStudent = {
  account: {
    balance: 0,
    lastPayment: null
  },
  contacts: []
};

const postNewStudent = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  try {
    let newStudent = Object.assign(req.body, defaultStudent);
    
    let result = await r.table("students")
      .insert(newStudent)
      .run(req.rdb);

    let [ id ] = result.generated_keys;
    
    res.status(201).json({ id });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.errors);
    }

    next(err);
  }
}

const putStudent = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  try {
    let student = await findStudent(id, req.rdb);

    if (!student) {
      return res.sendStatus(404);
    }

    let result = await r.table("students")
      .get(id)
      .update(req.body)
      .run(req.rdb);

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
}

const deleteStudent = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  try {
    let student = await findStudent(id, req.rdb);
    
    if (!student) {
      return res.sendStatus(404);
    }

    await r.table("students")
      .get(id)
      .delete()
      .run(req.rdb);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

const getStudentContacts = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  
  try {
    let contacts = await r.table("students")
      .get(id)
      .merge(student => {
        return {
          contacts: r.table("contacts")
            .getAll(r.args(student("contacts")))
            .coerceTo("array")
        };
      })("contacts")
      .run(req.rdb);

    res.json(contacts);
  } catch (err) {
    if (err instanceof r.Error.ReqlNonExistenceError) {
      if ((err.msg as string).indexOf("`null`") >= 0) {
        return res.sendStatus(404);
      } else if (err.msg.startsWith("No attribute `contacts` in object")) {
        return res.json([]);
      }
    }

    next(err);
  }
}

const postStudentContact = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  try {
    let newContact = req.body;

    let result = await r.table("contacts")
      .insert(newContact)
      .run(req.rdb);

    let [ contactId ] = result.generated_keys;

    await r.table("students")
      .get(id)
      .update({ contacts: r.row("contacts").append(contactId) })
      .run(req.rdb);
    
    res.status(201).json(contactId);
  } catch (err) {
    next(err);
  }
} 

const deleteStudentContact = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id, contactId } = req.params;

  try {
    await r.table("contacts")
      .get(contactId)
      .delete()
      .run(req.rdb);

    await r.table("students")
      .get(id)
      .update(row => {
        return {
          contacts: row("contacts").filter(contact => contact.ne(contactId))
        }
      })
      .run(req.rdb);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
}

const getStudentTransactions = async (req: RethinkRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  try {
    let exists = await studentExists(id, req.rdb);
    
    if (!exists) {
      return res.sendStatus(404);
    }

    let txs = await r.table("transactions")
      .filter({ accountId: id })
      .without("accountId")
      .orderBy("date")
      .run(req.rdb);

    res.json(txs);
  } catch (err) {
    next(err);
  }
}

export const studentRouter = Router();

studentRouter
  .get("/", getPagedStudents, getStudents)
  .get("/names", getStudentNames)
  .get("/:id", getStudentById)
  .post("/", postNewStudent)
  .put("/:id", putStudent)
  .delete("/:id", deleteStudent)
  .get("/:id/contacts", getStudentContacts)
  .post("/:id/contacts", postStudentContact)
  .delete("/:id/contacts/:contactId", deleteStudentContact)
  .get("/:id/transactions", getStudentTransactions);
  
studentRouter.use(statusErrorHandler);



onConnect(async (err, connection) => {
  console.log("studentChangeFeed");
  let studentChangeFeed = await r.table("students").changes().run(connection);

  studentChangeFeed.each((err, change: Change<Student>) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(change);

    //let changeSet = getNewValues(change, "firstName", "lastName");
    let changeSet = getChangeDiff(change.new_val, change.old_val);

    console.log("student changes...", changeSet);
  });
});


interface Student {
  firstName: string;
  lastName: string;
  account: {
    balance: number;
    lastPayment?: Date;
  }
}

type StudentKeys = keyof Student;


const checkNested = (obj: Object, ...args: string[]): boolean => {
  for (let i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }

    obj = obj[args[i]];
  }

  return true;
}

const getChangeDiff = (value1, value2) => {
  if (value1 === value2) {
    return null;
  }

  const clone = (value) => {
    if (value == null || typeof value != "object") {
      return value;
    }

    let isArray = Array.isArray(value);
    let obj = isArray ? [] : {};

    if (!isArray) {
      Object.assign({}, value);
    }

    for (let i in value) {
      obj[i] = clone(value[i]);
    }

    return obj;
  }

  // different types or array compared to non-array
  if (typeof value1 !== typeof value2 || Array.isArray(value1) !== Array.isArray(value2)) {
    return [clone(value1), clone(value2)];
  }

  // different scalars... no cloning needed
  if (typeof value1 !== "object" && value1 !== value2) {
    return [value1, value2];
  }

  // one is null and the other isn't
  // both null would have been caught by the '===' comparison above
  if (value1 == null || value2 == null) {
    return [clone(value1), clone(value2)];
  }

  let isArray = Array.isArray(value1);

  let left = isArray ? [] : {};
  let right = isArray ? [] : {};

  for (let i in value1) {
    if (!value2.hasOwnProperty(i)) {
      left[i] = clone(value1[i]);
    } else {
      let subDiff = getChangeDiff(value1[i], value2[i]);

      if (isArray || subDiff) {
        if (subDiff &&
            areDiffsObjects(subDiff[0], subDiff[1]) &&
            areDiffsEmpty(subDiff[0], subDiff[1])) {
          continue;
        }

        if (subDiff && arraysEqual(subDiff[0], subDiff[1])) {
          continue;
        }

        left[i] = subDiff ? clone(subDiff[0]) : null;
        right[i] = subDiff ? clone(subDiff[1]) : null;
      }
    }
  }

  for (let i in value2) {
    if (!value1.hasOwnProperty(i)) {
      right[i] = clone(value2[i]);
    }
  }

  return [left, right];
}

const areDiffsObjects = (left, right): boolean => {
  /*if (!left || !right) {
    return false;
  }*/

  return isObject(left) && isObject(right);
}

const areDiffsEmpty = (left, right): boolean => {
  return isEmpty(left) && isEmpty(right);
}

const isEmpty = (obj: Object): boolean => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }

  return true;
}

const arraysEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

const isObject = (value): value is Object => {
  return typeof value === "object";
}

const isArray = (value): value is any[] => {
  return Array.isArray(value);
}

/*onConnect(async (err, connection) => {
  let results = await r.table("transactions")
  .pluck("id", "date")
  .run(connection);

  let values: { id: string, date: string}[] = await results.toArray();
  console.log(values);
  
  let newValues = values.map(value => {
    return {
      id: value.id,
      date: (new Date(value.date)).toISOString()
    }
  })
  
  console.log(newValues);
  
  newValues.forEach(async newValue => {
    await r.table("transactions")
      .get(newValue.id)
      .update({ date: r.ISO8601(newValue.date) })
      .run(connection);
  });
})*/
