
import * as r from "rethinkdb";
import { getConnection } from "./data-access";
import { Student, Contact } from "./student.model";
import { Transaction } from "./transaction.models";
import { OnResponseFinish } from "./on-response-finish";
import { AccountService } from "./account.service";
import { AccountType } from "./account.model";

const inactiveFilter = (includeInactive: boolean) => r.branch(!includeInactive, { active: true }, {});

export class StudentService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }

  studentCount(includeInactive: boolean = false): Promise<number> {
    return r.table("students")
      .filter(inactiveFilter(includeInactive))
      .count()
      .run(this.connection);
  }

  async studentExists(id: string): Promise<boolean> {
    return await r.table("students")
      .getAll(id)
      .count().eq(1)
      .run(this.connection);
  }

  findStudent(id: string) {
    return r.table("students")
      .get<Student>(id)
      .without("contacts")
      .run(this.connection);
  }

  async pagedStudents({ start, end }: { start: number, end: number }, includeInactive: boolean = false): Promise<Student[]> {
    let cursor = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      .filter(inactiveFilter(includeInactive))
      .slice(start, end)
      .run(this.connection);
  
    return await cursor.toArray<Student>();
  }

  async allStudents(includeInactive: boolean = false, ...props: string[]): Promise<Student[]> {
    console.log("includeInactive", includeInactive);

    let students = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      .filter(inactiveFilter(includeInactive));
  
    if (props && props.length > 0) {
      students = students.pluck(...props);
    }
    
    let cursor = await students.run(this.connection);
  
    return cursor.toArray<Student>();
  }

  async studentContacts(id: string): Promise<Contact[]> {
    let contacts: Contact[] = await r.table("students")
      .get<Student>(id)
      .merge(student => {
        return {
          contacts: r.table("contacts")
            .getAll(r.args(student("contacts").default([])))
            .coerceTo("array")
        };
      })("contacts")
      .run(this.connection);
    
    return contacts;
  }

  async insertStudent(student: Partial<Student>): Promise<string> {
    const defaultStudent = {
      account: {
        balance: 0,
        lastPayment: null
      },
      contacts: []
    };

    const createNewStudent = async () => {
      let newStudent = Object.assign(student, defaultStudent) as Student;

      let result = await r.table("students")
        .insert(newStudent)
        .run(this.connection);
  
      let [ id ] = result.generated_keys;
      newStudent.id = id;

      return newStudent;
    }

    const createStudentAccount = async (student: Student) => {
      let accountService = new AccountService(this.connection);
      
      await accountService.insertAccount({
        id: student.id,
        name: student.firstName + " " + student.lastName,
        type: AccountType.Asset
      });
    };

    const addStudentToAccountsReceiveable = async (studentId: string) => {
      let accountService = new AccountService(this.connection);
      const accountsReceiveableId = "8f39a3d8-077e-4d88-af16-ef640ce3a90c";
  
      await accountService.addSubAccount(accountsReceiveableId, studentId);
    };

    let newStudent = await createNewStudent();
    
    await createStudentAccount(newStudent);
    await addStudentToAccountsReceiveable(newStudent.id);
  
    return newStudent.id;
  }

  async updateStudent(id: string, value: any): Promise<void> {
    await r.table("students")
      .get(id)
      .update(value)
      .run(this.connection);
  }

  async deleteStudent(id: string): Promise<void> {
    await r.table("students")
      .get(id)
      .delete()
      .run(this.connection);
  }

  async insertStudentContact(studentId: string, value: any): Promise<string> {
    let result = await r.table("contacts")
      .insert(value)
      .run(this.connection);
    
    let [ contactId ] = result.generated_keys;
    
    await r.table("students")
      .get(studentId)
      .update({ contacts: r.row("contacts").default([]).append(contactId) })
      .run(this.connection);
  
    return contactId;
  }

  async deleteStudentContact(studentId: string, contactId: string): Promise<void> {
    await r.table("contacts")
      .get(contactId)
      .delete()
      .run(this.connection);

    await r.table("students")
      .get(studentId)
      .update(row => {
        return {
          contacts: row("contacts").filter(contact => contact.ne(contactId))
        }
      })
      .run(this.connection);
  }

  async isStudentAccount(accountId: string) {
    return r.table("students")
      .getAll(accountId)
      .count().eq(1)
      .run(this.connection);
  }

  async updateStudentAccount(accountId: string, { balance, lastPayment }: { balance: number, lastPayment: Date }) {
    await r.table("students")
      .get(accountId)
      .update({ account: { balance, lastPayment } })
      .run(this.connection);
  }

  async finish(): Promise<void> {
    await this.connection.close();
  }

}
