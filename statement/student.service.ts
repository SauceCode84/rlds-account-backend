
import { IStudentModel } from "./student.model";
//import { Student } from "./student.schema";

import { PageOptions, PagedResults } from "./pagination";

import { compare, compareCaseInsensitive } from "./util";
import { StatusError } from "./status.error";

/*export class StudentService {
  
    public async getStudents(options: PageOptions) {
      let { page, pageSize } = options;
      let results: IStudentModel[] | IPagedResults<IStudentModel>;
      results = await Student.find({});
  
      if (page || pageSize) {
        page = parseInt(page) || 1;
        pageSize = parseInt(pageSize) || 10;
  
        let count = results.length;
        let totalPages = Math.ceil(count / pageSize);
  
        if (page > totalPages) {
          throw new StatusError(400, "Invalid page number");
        }
  
        results = results
          .sort(this.sortStudent)
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

    public async getStudentNames() {
      let results = await Student.find({}).select("firstName lastName grade");

      return results.sort(this.sortStudent);
    }

    private sortStudent(a: IStudentModel, b: IStudentModel) {
      return compare(a.grade, b.grade)
        || compareCaseInsensitive(a.lastName, b.lastName)
        || compareCaseInsensitive(a.firstName, b.firstName);
    }
  
  }
*/