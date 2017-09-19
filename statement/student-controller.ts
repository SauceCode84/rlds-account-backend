
import { NextFunction, Request, Response, Router, RequestHandler, ErrorRequestHandler } from "express";

import { Student } from "./student.schema";
import { IStudentModel } from "./student.model";

import { Controller } from "./controller.decorator";
import { Get, Post, Put } from "./request-mapping.decorators";
import { StudentService } from "./student.service";
import { StatusError } from "./status.error";
import { PageOptions, IPagedResults, paginateResults, validPageOptions, extractPagination } from "./pagination";
import { compare, compareCaseInsensitive } from "./util";

/*@Controller("/student")
export class StudentController {
  
  @Get()
  public async getAll(req: Request, res: Response, next: NextFunction) {
    let { page, pageSize, includeSummary } = req.query;
    includeSummary = includeSummary || false;
    
    try {
      let students = await new StudentService().getStudents({ page, pageSize });

      res.json(students);
    } catch(err) {
      if (err instanceof StatusError) {
        return res.status(err.statusCode).json(err.message);
      }

      next(err);
    }
  }

  @Get("/names")
  public async getStudentNames(req: Request, res: Response) {
    let students = await new StudentService().getStudentNames();
    res.json(students);
  }

  @Get("/:id")
  public async getById(req: Request, res: Response, next: NextFunction) {
    let id: string = req.params.id;

    try {
      let student = await Student.findById(id);

      if (!student) {
        return res.sendStatus(404);
      }

      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  }

  @Post()
  public async insert(req: Request, res: Response, next: NextFunction) {
    try {
      let newStudent = new Student(req.body);
      await newStudent.save();

      res.status(200).json({ id: newStudent.id });
    } catch (err) {
      if (err.name === "ValidationError") {
        return res.status(400).send(err.errors);
      }

      next(err);
    }
  }

  @Put("/:id")
  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      let { id } = req.params;
      let student = await Student.findById(id);

      if (!student) {
        return res.sendStatus(404);
      }

      await student.update(req.body);
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

}*/

const statusErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof StatusError) {
    return res.status(err.statusCode).json(err.message);
  }

  next(err);
}

const studentCompare = (a: IStudentModel, b: IStudentModel) => {
  return compare(a.grade, b.grade)
    || compareCaseInsensitive(a.lastName, b.lastName)
    || compareCaseInsensitive(a.firstName, b.firstName);
}

const fetchPagedStudents = async (options: PageOptions) => {
  let students = await Student.find({});
  return paginateResults(students.sort(studentCompare))(options);
}

const getPagedStudents = async (req: Request, res: Response, next: NextFunction) => {
  let pageOptions = extractPagination(req);
  
  if (!validPageOptions(pageOptions)) {
    return next();
  }

  try {
    res.json(await fetchPagedStudents(pageOptions));
  } catch (err) {
    next(err);
  }
}

const getStudents = async (req: Request, res: Response, next: NextFunction) => {
  res.json(await Student.find({}));
}

const getStudentNames = async (req: Request, res: Response) => {
  let students = await Student.find({}).select("firstName lastName grade");
  
  res.json(students.sort(studentCompare));
}

const getStudentById = async (req: Request, res: Response, next: NextFunction) => {
  let { id } = req.params;
  
  try {
    let student = await Student.findById(id);

    if (!student) {
      return res.sendStatus(404);
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
}

const postNewStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let newStudent = new Student(req.body);
    await newStudent.save();

    res.json({ id: newStudent.id });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).send(err.errors);
    }

    next(err);
  }
}

const putStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { id } = req.params;
    let student = await Student.findById(id);

    if (!student) {
      return res.sendStatus(404);
    }

    await student.update(req.body);
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
  .put(":/id", putStudent);

studentRouter.use(statusErrorHandler);
