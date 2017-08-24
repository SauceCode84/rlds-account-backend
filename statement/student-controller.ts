
import { NextFunction, Request, Response, Router } from "express";

import { Student } from "./student.schema";
import { IStudentModel } from "./student.model";

import { Controller } from "./controller.decorator";
import { Get, Post, Put } from "./request-mapping.decorators";
import { compare, compareCaseInsensitive } from "./util";

@Controller("/student")
export class StudentController {
  
    @Get()
    public async getAll(req: Request, res: Response) {
      let includeSummary: boolean = req.query.includeSummary || false;
      let { page, pageSize } = req.query;

      let students = await new StudentService().getStudents({ page, pageSize });

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



interface IPagedResults<T> {
  totalCount: number;
  totalPages: number;
  page: number;
  results: T[];    
}

type PageOptions = { page?: any, pageSize?: any };

class StudentService {

  async getStudents(options: PageOptions) {
    let { page, pageSize } = options;
    let results: IStudentModel[] | IPagedResults<IStudentModel>;
    results = await Student.find({});

    if (page || pageSize) {
      page = parseInt(page) || 1;
      pageSize = parseInt(pageSize) || 10;

      let count = results.length;
      let totalPages = Math.ceil(count / pageSize);

      /*if (page > totalPages) {
        throw new Error();
      }*/

      results = results.sort((a, b) => {
        return compare(a.grade, b.grade)
          || compareCaseInsensitive(a.lastName, b.lastName)
          || compareCaseInsensitive(a.firstName, b.firstName);
      })
      .slice((page - 1) * pageSize, page * pageSize);
      
      results = {
        totalCount: count,
        totalPages: totalPages,
        page: page,
        results: results          
      };
    }

    return results;
  }

}