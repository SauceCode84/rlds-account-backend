import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response, Router } from "express";

import * as r from "rethinkdb";

import "../array.last";

import { onConnect, getConnection } from "./data-access";
import { StatusError } from "./status.error";
import { paginateResults, validPageOptions, extractPagination, paginationSliceParams } from "./pagination";
import { Student } from "./student.model";

import { StudentService } from "./student.service";
import { ServiceRequest } from "./service-request";
import { responseFinishHandler } from "./response-finish-handler";

const statusErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof StatusError) {
    return res.status(err.statusCode).json(err.message);
  }

  next(err);
}

const getPagedStudents = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let pageOptions = extractPagination(req);

  if (!validPageOptions(pageOptions)) {
    return next();
  }

  let { service } = req;
  let { includeInactive } = req.query;
  includeInactive = includeInactive === "true";
    
  try {
    let result = await paginateResults(
      () => service.pagedStudents(paginationSliceParams(pageOptions), includeInactive),
      () => service.studentCount(includeInactive),
      pageOptions);
    
    res.json(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
}

const getStudents = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { includeInactive } = req.query;
  
  let students = await req.service.allStudents(includeInactive === "true");

  res.json(students);
}

const getStudentNames = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { includeInactive } = req.query;
  let students = await req.service.allStudents(includeInactive, "id", "firstName", "lastName", "grade");
  
  res.json(students);
}

const validateStudentExists = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  let exists = await req.service.studentExists(id);
  
  if (!exists) {
    return res.sendStatus(404);
  }

  next();
}

const getStudentById = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  let student = await req.service.findStudent(id);

  res.json(student);
}

const postNewStudent = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let id = await req.service.insertStudent(req.body);
    
  res.status(201).json({ id });
}

const putStudent = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  await req.service.updateStudent(id, req.body);

  res.sendStatus(200);
}

const deleteStudent = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;

  await req.service.deleteStudent(id);

  res.sendStatus(204);
}

const getStudentContacts = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  let contacts = await req.service.studentContacts(id);

  res.json(contacts);
}

const postStudentContact = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id } = req.params;
  let contactId = await req.service.insertStudentContact(id, req.body);
    
  res.status(201).json(contactId);
} 

const deleteStudentContact = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  let { id, contactId } = req.params;

  await req.service.deleteStudentContact(id, contactId);

  res.sendStatus(204);
}

export const studentRouter = Router();

type StudentServiceRequest = ServiceRequest<StudentService>;

const serviceRequestHandler = async (req: StudentServiceRequest, res: Response, next: NextFunction) => {
  const connection: r.Connection = await getConnection();
  const service: StudentService = new StudentService(connection);
  
  req.service = service;

  res.on("finish", responseFinishHandler(req));

  next();
}

studentRouter
  .use(serviceRequestHandler);

studentRouter
  .use("/:id/*", validateStudentExists);

studentRouter
  .get("/", getPagedStudents, getStudents)
  .get("/names", getStudentNames)
  .get("/:id", getStudentById)
  .post("/", postNewStudent)
  .put("/:id", putStudent)
  .delete("/:id", deleteStudent)
  .get("/:id/contacts", getStudentContacts)
  .post("/:id/contacts", postStudentContact)
  .delete("/:id/contacts/:contactId", deleteStudentContact);
  
studentRouter.use(statusErrorHandler);



onConnect(async (err, connection) => {
  console.log("studentChangeFeed");
  let studentChangeFeed = await r.table("students").changes().run(connection);

  studentChangeFeed.each((err, change: r.Change<Student>) => {
    if (err) {
      console.error(err);
      return;
    }

    //console.log(change);

    //let changeSet = getNewValues(change, "firstName", "lastName");
    //let changeSet = getChangeDiff(change.new_val, change.old_val);

    //console.log("student changes...", changeSet);
  });
});





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
