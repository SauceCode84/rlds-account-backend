
import { NextFunction, Request, Response, Router } from "express";

import { Student } from "./student.schema";
import { IStudentModel } from "./student.model";

import { Controller } from "./controller.decorator";
import { Get, Post, Put } from "./request-mapping.decorators";

@Controller("/student")
export class StudentController {
  
    @Get()
    public async getAll(req: Request, res: Response) {
      let includeSummary: boolean = req.query.includeSummary || false;
      let { page, pageSize } = req.query;

      if (page || pageSize) {
        page = parseInt(page) || 1;
        pageSize = parseInt(pageSize) || 10;

        let count = await Student.find({}).count();
        let totalPages = Math.ceil(count / pageSize);

        if (page > totalPages) {
          return res.sendStatus(400);
        }

        let results = await Student.find({});

        results.sort((a, b) => {
          return compare(a.grade, b.grade)
            || compareCaseInsensitive(a.lastName, b.lastName)
            || compareCaseInsensitive(a.firstName, b.firstName);
        })
        .slice((page - 1) * pageSize, page * pageSize);
        
        res.status(200).json({
          totalCount: count,
          totalPages: totalPages,
          page: page,
          results: results          
        })
      } else {
        let students = await Student.find({});
        res.status(200).json(students);
      }
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
        let id: string = req.params.id;
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
  
  }

const compare = <T>(a: T, b: T): number => {
  if (a > b) return +1;
  if (a < b) return -1;
  return 0;
}

const compareCaseInsensitive = (a: string, b: string): number => {
  return compare(a.toLowerCase(), b.toLowerCase());
}
