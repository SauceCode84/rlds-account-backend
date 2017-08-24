
import { IStudentModel } from "./student.model";
import { Student } from "./student.schema";

import { PageOptions, IPagedResults } from "./pagination";

import { compare, compareCaseInsensitive } from "./util";

export class StudentService {
  
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
