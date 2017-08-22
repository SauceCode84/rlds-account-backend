
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

      let page = req.query.page;
      let pageSize = req.query.pageSize;

      if (page || pageSize) {
        page = parseInt(page) || 1;
        pageSize = parseInt(pageSize) || 10;

        let count = await Student.find({}).count();
        let totalPages = Math.ceil(count / pageSize);

        if (page > totalPages) {
          return res.sendStatus(400);
        }

        let results = await Student.find({}).skip((page - 1) * pageSize).limit(pageSize);
        
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

    @Put()
    public async update(req: Request, res: Response) {
      
    }
  
  }
