
import { NextFunction, Request, Response, Router } from "express";

import { Student } from "./student.schema";

export class StudentController {
  
    public static create(router: Router) {
      router.get("/student", (req, res, next) => {
        new StudentController().all(req, res, next);
      });
    }
  
    public async all(req: Request, res: Response, next: NextFunction) {
      let students = await Student.find({});
      res.status(200).json(students);
    }
  
  }
