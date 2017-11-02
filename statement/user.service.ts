import * as r from "rethinkdb";
import * as bcrypt from "bcrypt";

import { User } from "./user.model";
import { getConnection } from "./data-access";
import { OnResponseFinish } from "./on-response-finish";

export class UserService implements OnResponseFinish {
  
  constructor(private connection: r.Connection) { }
  
  /**
   * Returns all the users
   */
  async getUsers(): Promise<User[]> {
    let userSeq = await r.table("users")
      .without("password")
      .run(this.connection);
    
    let users: User[] = await userSeq.toArray<User>();
    
    return users;
  }

  /**
   * Returns the user for the given id, or returns null if the user is not found
   * @param id The user id to search for
   * @param includePassword Determines whether or not to include the password field
   */
  async getUserById(id: string, includePassword = false): Promise<User> {
    let userSeq = await r.table("users").get<User>(id)

    if (!includePassword) {
      userSeq = userSeq.without("password");
    }

    let user: User = await userSeq.run(this.connection);

    return user;
  }

  /**
   * Returns whether or not the user exists, given the user id
   * @param id The user's id
   */
  async userExists(id: string): Promise<boolean> {
    let userCount: number = await r.table("users")
      .filter({ id })
      .count()
      .run(this.connection);

    return userCount > 0;
  }

  /**
   * Validates the user, based on the email and password combination, and returns the User object on success
   * @param email The user's email to validate
   * @param password The user's password to validate
   */
  async validateUser(email: string, password: string): Promise<User> {
    let [ user ] = <User[]> await r.table("users")
      .filter({ email })
      .limit(1)
      .coerceTo<User>("array")
      .run(this.connection);
      
      if (!user) {
        throw new Error("User email not found");
      }
      
      let passwordsMatch = await bcrypt.compare(password, user.password);

      if (!passwordsMatch) {
        throw new Error("Passwords don't match");
      }
      
      return user;
  }

  async finish(): Promise<void> {
    await this.connection.close();
    console.log("UserService.finish()", "connection closed...");
  }
  
}





const hashPassword = (password: string) => bcrypt.hash(password, 8);

/**
 * Creates a user with the given email and password, and returns the new user's id
 * @param email The new user's email
 * @param password The new user's password
 * @returns The new user's id
 */
export const createUser = async (email: string, password: string): Promise<string> => {
  try {
    let hashedPassword = await hashPassword(password);
    let newUser = {
      email,
      password: hashedPassword
    };

    let connection = await getConnection();
    let result = await r.table("users")
      .insert(newUser)
      .run(connection);
  
    let [ id ] = result.generated_keys;

    return id;
  } catch(err) {
    console.error(err);
    throw err;
  }
}

/**
 * Updates the user with id with the password provided
 * @param id The user's id
 * @param password The user's new password
 */
export const changePassword = async (id: string, password: string) => {
  let hashedPassword = await hashPassword(password);
  let connection = await getConnection();

  let result = await r.table("users")
    .update({ password: hashedPassword })
    .run(connection);
}

/**
 * Update the specified user with the given changes
 * @param id The user's id
 * @param changes The changes to update the user with
 */
export const updateUser = async (id: string, changes: { name?: string, roles?: string[] }): Promise<void> => {
  try {
    let connection = await getConnection();

    await r.table("users")
      .get(id)
      .update(changes)
      .run(connection);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
