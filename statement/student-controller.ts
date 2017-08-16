
import { NextFunction, Request, Response, Router } from "express";

import { Student } from "./student.schema";

import { Controller } from "./controller.decorator";
import { Get, Post } from "./request-mapping.decorators";

@Controller("/student")
export class StudentController {
  
    @Get()
    public async all(req: Request, res: Response, next: NextFunction) {
      let students = await Student.find({});
      res.status(200).json(students);
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
  
  }
