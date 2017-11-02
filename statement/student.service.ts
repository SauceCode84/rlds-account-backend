
import * as r from "rethinkdb";
import { getConnection } from "./data-access";
import { Student, Contact } from "./student.model";
import { Transaction } from "./transaction.models";
import { OnResponseFinish } from "./on-response-finish";

export class StudentService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }

  studentCount(): Promise<number> {
    return r.table("students")
      .count()
      .run(this.connection);
  }

  async studentExists(id: string): Promise<boolean> {
    let student = await r.table("students")
      .get<Student>(id)
      .run(this.connection);
  
    return student !== undefined && student !== null;
  }

  findStudent(id: string) {
    return r.table("students")
      .get<Student>(id)
      .without("contacts")
      .run(this.connection);
  }

  async pagedStudents({ start, end }: { start: number, end: number }): Promise<Student[]> {
    let cursor = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" })
      .slice(start, end)
      .run(this.connection);
  
    return await cursor.toArray<Student>();
  }

  async allStudents(...props: string[]): Promise<Student[]> {
    let seq = await r.table("students")
      .orderBy(r.row("lastName").downcase(), r.row("firstName").downcase(), { index: "gradeSort" });
  
    if (props && props.length > 0) {
      seq = seq.pluck(...props);
    }
    
    let cursor = await seq.run(this.connection);
  
    return cursor.toArray<Student>();
  }

  async studentContacts(id: string): Promise<Contact[]> {
    let contacts: Contact[] = await r.table("students")
      .get<Student>(id)
      .merge(student => {
        return {
          contacts: r.table("contacts")
            .getAll(r.args(student("contacts")))
            .coerceTo<Contact>("array")
        };
      })("contacts")
      .run(this.connection);
    
    return contacts;
  }

  async insertStudent(value: any): Promise<string> {
    const defaultStudent = {
      account: {
        balance: 0,
        lastPayment: null
      },
      contacts: []
    };
  
    let newStudent = Object.assign(value, defaultStudent);
    
    let result = await r.table("students")
      .insert(newStudent)
      .run(this.connection);
  
    let [ id ] = result.generated_keys;
  
    return id;
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

  async studentTransactions(id: string): Promise<Transaction[]> {
    let cursor = await r.table("transactions")
      .filter({ accountId: id })
      .without("accountId")
      .orderBy("date")
      .run(this.connection);

    return await cursor.toArray<Transaction>();
  }

  async finish(): Promise<void> {
    await this.connection.close();
  }

}
