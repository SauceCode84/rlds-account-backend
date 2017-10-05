import { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response, Router } from "express";

import * as r from "rethinkdb";

import { RethinkDb } from "./data-access";
import { StatusError } from "./status.error";
import { PageOptions, PagedResults, paginateResults, validPageOptions, extractPagination } from "./pagination";

const statusErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof StatusError) {
    return res.status(err.statusCode).json(err.message);
  }

  next(err);
}

type RethinkRequest = Request & RethinkDb;

const studentCount = (connection: any): Promise<number> =>
  r.table("students").count().run(connection);

const findStudent = (id: string, connection: any): Promise<any> =>
  r.table("students")
   .get(id)
   .without("contacts")
   .run(connection);

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
    .pluck("firstName", "lastName", "grade")
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

const getStudents = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const getStudentNames = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const getStudentById = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const postNewStudent = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const putStudent = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const deleteStudent = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const getStudentContacts = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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

const postStudentContact = async (req: Request & RethinkDb, res: Response, next: NextFunction) => {
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
  .delete("/:id/contacts/:contactId", deleteStudentContact);
  
studentRouter.use(statusErrorHandler);
