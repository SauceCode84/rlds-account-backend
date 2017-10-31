import * as r from "rethinkdb";
import * as bcrypt from "bcrypt";

import { User } from "./user.model";
import { getConnection } from "./data-access";

export const getUsers = async (): Promise<User[]> => {
  try {
    let connection = await getConnection();
    let userSeq = await r.table("users")
      .without("password")
      .run(connection);

    let users: User[] = await userSeq.toArray<User>();

    return users;
  } catch (err) {
    console.error(err);
    throw(err);
  }
}

/**
 * Returns the user for the given id, or returns null if the user is not found
 * @param id The user id to search for
 * @param includePassword Determines whether or not to include the password field
 */
export const getUserById = async (id: string, includePassword = false): Promise<User> => {
  try {
    let connection = await getConnection();
    let userSeq = await r.table("users").get<User>(id)

    if (!includePassword) {
      userSeq = userSeq.without("password");
    }

    let user: User = await userSeq.run(connection);

    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Returns whether or not the user exists, using the specified user id
 * @param id The user's id
 */
export const userExists = async (id: string): Promise<boolean> => {
  try {
    let connection = await getConnection();
    let userCount: number = await r.table("users")
      .filter({ id })
      .count()
      .run(connection);

    return userCount > 0;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Validates the user, based on the email and password combination, and returns the User object on success
 * @param email The user's email to validate
 * @param password The user's password to validate
 */
export const validateUser = async (email: string, password: string): Promise<User> => {
  try {
    let connection = await getConnection();

    let [ user ] = <User[]> await r.table("users")
      .filter({ email })
      .limit(1)
      .coerceTo("array")
      .run(connection);
    
    if (!user) {
      throw new Error("User email not found");
    }
    
    let passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      throw new Error("Passwords don't match");
    }
    
    return user;
  } catch(err) {
    console.error(err);
    throw err;
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
