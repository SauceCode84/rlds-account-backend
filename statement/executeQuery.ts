import * as r from "rethinkdb";

import { getConnection } from "./data-access";

export type QueryFn<TResult> = (connection: r.Connection) => (...args) => Promise<TResult>;

/**
 * Executes the query, by opening a new connection, running the query, closing the connection and returning the result
 * @param query The query to execute
 */
export const executeQuery = <TResult>(query: QueryFn<TResult>) => async (...args) => {
  let connection = await getConnection();
  let result = await query(connection)(...args);

  await connection.close();

  return result;
}
