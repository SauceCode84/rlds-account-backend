// Type definitions for RethinkDB 2.3
// Project: http://rethinkdb.com/
// Definitions by: Alex Gorbatchev <https://github.com/alexgorbatchev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.3

// Reference: https://rethinkdb.com/api/javascript/
//
// Notes:
//   - Currently missing control structures and geospatial commands. Please help out!
//
// Testing:
//   $ tsc --noImplicitAny --module commonjs -p rethinkdb/

/// <reference types="node"/>

/**
 * https://rethinkdb.com/api/javascript/
 */
declare module "rethinkdb" {
    
    import { ConnectionOptions as TLSConnectionOptions } from "tls";
    
    /**
     * Create a new connection to the database server.
     *
     * See: https://rethinkdb.com/api/javascript/connect/
     */
    export function connect(opts: ConnectionOptions, cb: (err: ReqlDriverError, conn: Connection) => void): void;
    export function connect(host: string, cb: (err: ReqlDriverError, conn: Connection) => void): void;
    export function connect(opts: ConnectionOptions): Promise<Connection>;
    export function connect(host: string): Promise<Connection>;

    export function dbCreate(name: string): Operation<CreateResult>;
    export function dbDrop(name: string): Operation<DropResult>;
    export function dbList(): Operation<string[]>;

    export function db(name: string): Db;
    export function table(name: string, options?: { useOutdated: boolean }): Table;

    export function tableCreate(name: string, options?: TableOptions): Operation<CreateResult>;
    export function tableList(): Operation<string[]>;

    export function asc(property: string): Sort;
    export function desc(property: string): Sort;

    export var count: Aggregator;
    export function sum(prop: string): Aggregator;
    export function avg(prop: string): Aggregator;

    export const row: Row;
    export function expr(value: any): Expression<any>;

    export function args(args: string[] | Expression<any> | Sequence): string[];
    
    export function now(): Expression<Time>;

    // Control Structures
    export function branch(test: Expression<boolean>, trueBranch: Expression<any>, falseBranch: Expression<any>): Expression<any>;

    /**
     * Create a javascript expression.
     *
     * @param {Number} timeout - The number of seconds before `r.js` times out. The default value is `5` seconds.
     */
    export function js(jsString: string, opts?: { timeout: number }): Operation<any>;

    /**
     * Return a UUID (universally unique identifier), a string that can be used as a unique ID. If a string is passed to uuid as an argument, the UUID will be deterministic, derived from the string’s SHA-1 hash.
     *
     * RethinkDB’s UUIDs are standards-compliant. Without the optional argument, a version 4 random UUID will be generated; with that argument, a version 5 UUID will be generated, using a fixed namespace UUID of 91461c99-f89d-49d2-af96-d8e2e14e9b58.
     */
    export function uuid(input?: string): Operation<string>;

    export class Cursor {
        hasNext(): boolean;

        each(cb: (err: Error, row: any) => void, done?: () => void): void;
        each<T>(cb: (err: Error, row: T) => void, done?: () => void): void;
        each(cb: (err: Error, row: any) => boolean, done?: () => void): void; // returning false stops iteration
        each<T>(cb: (err: Error, row: T) => boolean, done?: () => void): void; // returning false stops iteration
        
        eachAsync<T>(cb: (row: T) => Promise<any>): Promise<void>;
        eachAsync<T>(cb: (row: T) => void, final: FinalCallback): void;
        eachAsync<T>(cb: (row: T, done: DoneCallback) => void): Promise<void>;
        eachAsync<T>(cb: (row: T, done: DoneCallback) => void, final: FinalCallback): void;
        
        next(cb: (err: Error, row: any) => void): void;
        next<T>(cb: (err: Error, row: T) => void): void;
        
        toArray(cb: (err: Error, rows: any[]) => void): void;
        toArray<T>(cb: (err: Error, rows: T[]) => void): void;
        toArray(): Promise<any[]>;
        toArray<T>(): Promise<T[]>;
        
        close(cb: (err: Error) => void): void;
        close(): Promise<void>;
    }

    type DoneCallback = (error?: any) => void;
    type FinalCallback = (error?: any) => void;

    interface Row extends Expression<any> {
        (name: string): Expression<any>;
    }

    /**
     * Connection options.
     *
     * See: https://rethinkdb.com/api/javascript/connect/
     */
    interface ConnectionOptions {
        /** The host to connect to (default `localhost`) */
        host?: string;

        /** The port to connect on (default `28015`) */
        port?: number;

        /** The default database (default `test`) */
        db?: string;

        /** The user account to connect as (default `admin`) */
        user?: string;

        /** The password for the user account to connect as (default `''`, empty) */
        password?: string;

        /** Timeout period in seconds for the connection to be opened (default `20`) */
        timeout?: number;

        /**
         * A hash of options to support SSL connections (default `null`). Currently,
         * there is only one option available, and if the `ssl` option is specified,
         * this key is required.
         */
        ssl?: TLSConnectionOptions;
    }

    type waitFor = 'ready_for_outdated_reads' | 'ready_for_reads' | 'ready_for_writes';

    interface WaitOptions {
        waitFor?: waitFor;
        timeout?: number;
    }

    interface WaitResult {
        ready: number;
    }

    interface NoReplyWait {
        noreplyWait: boolean;
    }

    interface Connection {
        open: boolean;

        close(cb: (err: Error) => void): void;
        close(opts: NoReplyWait, cb: (err: Error) => void): void;
        close(): Promise<void>;
        close(opts: NoReplyWait): Promise<void>;

        reconnect(cb: (err: Error, conn: Connection) => void): void;
        reconnect(opts: NoReplyWait, cb: (err: Error, conn: Connection) => void): void;
        reconnect(opts?: NoReplyWait): Promise<Connection>;

        use(dbName: string): void;
        addListener(event: string, cb: Function): void;
        on(event: string, cb: Function): void;
    }

    interface Db {
        tableCreate(name: string, options?: TableOptions): Operation<CreateResult>;
        tableDrop(name: string): Operation<DropResult>;
        tableList(): Operation<string[]>;
        table(name: string, options?: GetTableOptions): Table;
        wait(waitOptions?: WaitOptions): WaitResult;
    }

    interface TableOptions {
        primaryKey?: string; // 'id'
        durability?: string; // 'soft'
        cache_size?: number;
        datacenter?: string;
    }

    interface GetTableOptions {
        useOutdated: boolean;
    }

    interface Writeable {
        update(obj: Object, options?: UpdateOptions): Operation<WriteResult>;
        replace(obj: Object, options?: UpdateOptions): Operation<WriteResult>;
        replace(expr: ExpressionFunction<any>): Operation<WriteResult>;
        delete(options?: UpdateOptions): Operation<WriteResult>;
    }

    /**
     * See: https://rethinkdb.com/api/javascript/changes/
     */
    interface ChangesOptions {
        /**
         * Controls how change notifications are batched. Acceptable values are `true`, `false` and a numeric value:
         *
         *   * `true`: When multiple changes to the same document occur before a batch of notifications is sent, the changes are “squashed” into one change. The client receives a notification that will bring it fully up to date with the server.
         *   * `false`: All changes will be sent to the client verbatim. This is the default.
         *   * `n`: A numeric value (floating point). Similar to `true`, but the server will wait `n` seconds to respond in order to squash as many changes together as possible, reducing network traffic. The first batch will always be returned immediately.
         */
        squash?: boolean | number;

        /**
         * The number of changes the server will buffer between client reads before it starts dropping changes and generates an error (default: 100,000).
         */
        changefeedQueueSize?: number;

        /**
         * If `true`, the changefeed stream will begin with the current contents of the table or selection being monitored. These initial results will have `new_val` fields, but no `old_val` fields. The initial results may be intermixed with actual changes, as long as an initial result for the changed document has already been given. If an initial result for a document has been sent and a change is made to that document that would move it to the unsent part of the result set (e.g., a changefeed monitors the top 100 posters, the first 50 have been sent, and poster 48 has become poster 52), an “uninitial” notification will be sent, with an `old_val` field but no `new_val` field.
         */
        includeInitial?: boolean;

        /**
         * If `true`, the changefeed stream will include special status documents consisting of the field `state` and a string indicating a change in the feed’s state. These documents can occur at any point in the feed between the notification documents described below. If `includeStates` is `false` (the default), the status documents will not be sent.
         */
        includeStates?: boolean;

        /**
         * If `true`, a changefeed stream on an `orderBy.limit` changefeed will include `old_offset` and `new_offset` fields in status documents that include `old_val` and `new_val`. This allows applications to maintain ordered lists of the stream’s result set. If `old_offset` is set and not `null`, the element at `old_offset` is being deleted; if `new_offset` is set and not `null`, then `new_val` is being inserted at `new_offset`. Setting `includeOffsets` to `true` on a changefeed that does not support it will raise an error.
         */
        includeOffsets?: boolean;

        /**
         * If `true`, every result on a changefeed will include a `type` field with a string that indicates the kind of change the result represents: `add`, `remove`, `change`, `initial`, `uninitial`, `state`. Defaults to `false`.
         */
        includeTypes?: boolean;
    }

    interface Change<T> {
      old_val?: T;
      new_val?: T;
      type?: ChangeTypes;
    }

    type ChangeTypes = "add" | "remove" | "change" | "initial" | "uninitial" | "state";

    interface HasFields<T> {
        /**
         * Test if an object has one or more fields. An object has a field if it has that key and the key has a non-null value.
         *
         * `hasFields` lets you test for nested fields in objects. If the value of a field is itself a set of key/value pairs, you can test for the presence of specific keys.
         *
         * See: https://rethinkdb.com/api/javascript/has_fields/
         */
        hasFields(selector: BooleanMap): T;

        /**
         * Test if an object has one or more fields. An object has a field if it has that key and the key has a non-null value. For instance, the object `{'a': 1,'b': 2,'c': null}` has the fields `a` and `b`.
         *
         * When applied to a single object, `hasFields` returns `true` if the object has the fields and `false` if it does not. When applied to a sequence, it will return a new sequence (an array or stream) containing the elements that have the specified fields.
         *
         * See: https://rethinkdb.com/api/javascript/has_fields/
         */
        hasFields(...fields: string[]): T;
    }

    interface Table extends Sequence, HasFields<Sequence> {
        indexCreate(name: string, index?: ExpressionFunction<any>): Operation<CreateResult>;
        indexDrop(name: string): Operation<DropResult>;
        indexList(): Operation<string[]>;
        indexWait(name?: string): Operation<Array<{ index: string, ready: true, function: number, multi: boolean, geo: boolean, outdated: boolean }>>;

        insert(obj: any[], options?: InsertOptions): Operation<WriteResult>;
        insert(obj: any, options?: InsertOptions): Operation<WriteResult>;

        get<TObjectType extends object>(key: string | Expression<string>): SingleRowSequence<TObjectType | null>;
        
        getAll(key: string | Expression<string>, index?: Index): Sequence; // without index defaults to primary key
        getAll(keys: string[], index?: Index): Sequence;
        getAll(...keys: string[]): Sequence;
        
        sync(): Operation<SyncResult>;

        wait(WaitOptions?: WaitOptions): WaitResult;
    }

    interface SyncResult {
      synced: number;
    }

    interface SingleRowSequence<T extends object> extends Operation<T>, Writeable {
      (prop: string): Sequence;

      changes(opts?: ChangesOptions): Sequence;

      merge<U extends object>(...objOrQuery: (U | ExpressionFunction<T>)[]): Expression<T & U>;
      
      without(...props: string[]): SingleRowSequence<T>;
    }

    interface Sequence extends Operation<Cursor>, Writeable {
        (prop: string): Sequence;

        between(lower: any, upper: any, index?: Index): Sequence;

        filter(rql: ExpressionFunction<boolean>): Sequence;
        filter(rql: Expression<boolean>): Sequence;
        filter(obj: { [key: string]: any }): Sequence;
        filter<T>(predicate: (doc: Expression<T>) => Expression<boolean>): Sequence;

        /**
         * Turn a query into a changefeed, an infinite stream of objects representing
         * changes to the query’s results as they occur. A changefeed may return changes
         * to a table or an individual document (a “point” changefeed). Commands such as
         * `filter` or `map` may be used before the changes command to transform or filter
         * the output, and many commands that operate on sequences can be chained after
         * `changes`.
         *
         * See: https://rethinkdb.com/api/javascript/changes/
         */
        changes(opts?: ChangesOptions): Sequence;

        // Join
        // these return left, right
        innerJoin(sequence: Sequence, join: JoinFunction<boolean>): Sequence;
        outerJoin(sequence: Sequence, join: JoinFunction<boolean>): Sequence;
        eqJoin(leftAttribute: string, rightSequence: Sequence, index?: Index): Sequence;
        eqJoin(leftAttribute: ExpressionFunction<any>, rightSequence: Sequence, index?: Index): Sequence;
        zip(): Sequence;

        // Transform
        map(transform: ExpressionFunction<any>): Sequence;
        map(transform: (doc: Expression<any>) => any): Sequence;
        withFields(...selectors: any[]): Sequence;
        concatMap(transform: (doc: Expression<any>) => Expression<any> | Sequence): Sequence;
        orderBy(...keys: string[]): Sequence;
        orderBy(...sorts: Sort[]): Sequence;
        skip(n: number): Sequence;
        limit(n: number): Sequence;
        slice(start: number, end?: number): Sequence;
        nth(n: number): Expression<any>;
        indexesOf(obj: any): Sequence;
        isEmpty(): Expression<boolean>;
        union(sequence: Sequence): Sequence;
        sample(n: number): Sequence;

        // Aggregate
        reduce(r: ReduceFunction<any>, base?: any): Expression<any>;
        count(): Expression<number>;
        
        sum(): Expression<number>;
        sum(field: string): Expression<number>;
        
        distinct(): Sequence;
        groupedMapReduce(group: ExpressionFunction<any>, map: ExpressionFunction<any>, reduce: ReduceFunction<any>, base?: any): Sequence;
        groupBy(...aggregators: Aggregator[]): Expression<Object>; // TODO: reduction object
        group<T>(key: keyof T): GroupedExpression<T[keyof T], T[]>;
        contains(prop: string): Expression<boolean>;

        // Manipulation
        pluck(...props: string[]): Sequence;
        //pluck<K extends keyof T>(...props: K[]): Sequence<{ [P in K]: T[P] }>;
        without(...props: string[]): Sequence;

        merge(obj: Object): Sequence;
        merge<T>(query: (doc: Expression<T>) => any): Sequence;

        // Control
        coerceTo<K extends keyof CoerceTypeMap>(type: K): CoerceTypeMap[K];

        /**
         * Provide a default value in case of non-existence errors. The `default` command evaluates its
         * first argument (the value it’s chained to). If that argument returns `null` or a non-existence
         * error is thrown in evaluation, then `default` returns its second argument. The second argument
         * is usually a default value, but it can be a function that returns a value.
         * @param value The default value or function
         */
        default<T>(value: T | ((err: Error) => Expression<T>)): Sequence;
    }

    interface Grouping<TGroup, TReduction> {
      group: TGroup;
      reduction: TReduction;
    }

    interface GroupedExpression<TGroup, TReduction> extends Expression<Grouping<TGroup, TReduction>> {
      count(): GroupedExpression<TGroup, number>;
    }

    type CoerceTypeMap = {
      "array": Expression<any[]>,
      "string": Expression<string>,
      "number": Expression<number>,
      "object": Expression<any>,
      "binary": Expression<any>
    }
    
    type ExpressionFunction<U> = <T>(doc: Expression<T>) => Expression<U>;

    interface JoinFunction<U> {
        (left: Expression<any>, right: Expression<any>): Expression<U>;
    }

    interface ReduceFunction<U> {
        (acc: Expression<any>, val: Expression<any>): Expression<U>;
    }

    interface InsertOptions {
        conflict?: 'error' | 'replace' | 'update' | ((id: string, oldDoc: any, newDoc: any) => any);
        durability?: 'hard' | 'soft';
        returnChanges?: boolean | 'always';
    }

    interface UpdateOptions {
        nonAtomic?: boolean;
        durability?: 'hard' | 'soft';
        returnChanges?: boolean;
    }

    interface WriteResult {
        inserted: number;
        replaced: number;
        unchanged: number;
        errors: number;
        deleted: number;
        skipped: number;
        first_error: Error;
        generated_keys: string[]; // only for insert
    }

    interface JoinResult {
        left: any;
        right: any;
    }

    interface CreateResult {
        created: number;
    }

    interface DropResult {
        dropped: number;
    }

    interface Index {
        index: string;
        left_bound?: string; // 'closed'
        right_bound?: string; // 'open'
    }

    interface BooleanMap {
        [key: string]: Boolean | BooleanMap;
    }

    interface Expression<T> extends Writeable, Operation<T>, HasFields<Expression<number>> {
        (prop: string): Expression<any>;
        (prop: Expression<string>): Expression<any>;
        <K extends keyof T>(prop: K): Expression<T[K]>;
        
        merge(query: Object | Expression<Object>): Expression<Object>;
        append(prop: string): Expression<Object>;
        contains(prop: string | Expression<any>): Expression<boolean>;

        and(b: boolean | Expression<boolean>): Expression<boolean>;
        or(b: boolean | Expression<boolean>): Expression<boolean>;
        eq(v: any | Expression<any>): Expression<boolean>;
        ne(v: any | Expression<any>): Expression<boolean>;
        not(): Expression<boolean>;

        gt(value: T): Expression<boolean>;
        ge(value: T): Expression<boolean>;
        lt(value: T): Expression<boolean>;
        le(value: T): Expression<boolean>;

        add(n: number): Expression<number>;

        /**
         * Subtract two numbers.
         *
         * See: https://rethinkdb.com/api/javascript/sub/
         *
         * Example:
         *
         *     r.expr(2).sub(2).run(conn, callback)
         */
        sub(n: number, ...numbers: number[]): Expression<number>;

        /**
         * Retrieve how many seconds elapsed between today and `date`.
         *
         * See: https://rethinkdb.com/api/javascript/sub/
         *
         * Example:
         *
         *     r.now().sub(365 * 24 * 60 * 60)
         */
        sub(date: Time): Expression<number>;

        sub(expr: Expression<number>): Expression<number>;

        mul(n: number): Expression<number>;
        div(n: number): Expression<number>;
        mod(n: number): Expression<number>;

        downcase(): Expression<string>;

        default(value: T): Expression<T>;
    }

    interface OperationOptions {
        /**
         * One of three possible values affecting the consistency guarantee for the query (default: 'single').
         *
         *   * 'single' (the default) returns values that are in memory (but not necessarily written to disk) on the primary replica.
         *   * 'majority' will only return values that are safely committed on disk on a majority of replicas. This requires sending a message to every replica on each read, so it is the slowest but most consistent.
         *   * 'outdated' will return values that are in memory on an arbitrarily-selected replica. This is the fastest but least consistent.
         */
        readMode: "single" | "majority" | "outdated";

        /**
         * What format to return times in (default: 'native'). Set this to 'raw' if you want times returned as JSON objects for exporting.
         */
        timeFormat: "native" | "raw";

        /**
         * Whether or not to return a profile of the query’s execution (default: false).
         */
        profile: boolean;

        /**
         * Possible values are 'hard' and 'soft'. In soft durability mode RethinkDB will acknowledge the write immediately after receiving it, but before the write has been committed to disk.
         */
        durability: "hard" | "soft";

        /**
         * What format to return `grouped_data` and `grouped_streams` in (default: 'native'). Set this to 'raw' if you want the raw pseudotype.
         */
        groupFormat: "native" | "raw";

        /**
         * Set to `true` to not receive the result object or cursor and return immediately.
         */
        noreply: boolean;

        /**
         * The database to run this query against as a string. The default is the database specified in the db parameter to connect (which defaults to test). The database may also be specified with the db command.
         */
        db: string;

        /**
         * The maximum numbers of array elements that can be returned by a query (default: 100,000). This affects all ReQL commands that return arrays. Note that it has no effect on the size of arrays being written to the database; those always have an upper limit of 100,000 elements.
         */
        arrayLimit: number;

        /**
         * What format to return binary data in (default: 'native'). Set this to 'raw' if you want the raw pseudotype.
         */
        binaryFormat: "native" | "raw";

        /**
         * Minimum number of rows to wait for before batching a result set (default: 8). This is an integer.
         */
        minBatchRows: number;

        /**
         * Maximum number of rows to wait for before batching a result set (default: unlimited). This is an integer.
         */
        maxBatchRows: number;

        /**
         * Maximum number of bytes to wait for before batching a result set (default: 1MB). This is an integer.
         */
        maxBatchBytes: number;

        /**
         * Maximum number of seconds to wait before batching a result set (default: 0.5). This is a float (not an integer) and may be specified to the microsecond.
         */
        maxBatchSeconds: number;

        /**
         * Factor to scale the other parameters down by on the first batch (default: 4). For example, with this set to 8 and maxBatchRows set to 80, on the first batch maxBatchRows will be adjusted to 10 (80 / 8). This allows the first batch to return faster.
         */
        firstBatchScaledownFactor: number;
    }

    interface Operation<T> {
        /**
         * Run a query on a connection. The callback will get either an error, a single JSON result, or a cursor, depending on the query.
         *
         * See: https://rethinkdb.com/api/javascript/run/
         */
        run(conn: Connection, opts: OperationOptions, cb: (err: Error, result: T) => void): void;
        run(conn: Connection, cb: (err: Error, result: T) => void): void;
        run(conn: Connection, opts: OperationOptions): Promise<T>;
        run(conn: Connection): Promise<T>;
    }

    interface Aggregator { }

    interface Sort { }

    interface ReqlType {
        $reql_type$: string;
    }

    interface Time extends ReqlType {
        $reql_type$: "TIME";
        epoch_time: number;
        timezone: string;
    }

    interface Binary extends ReqlType {
        $reql_type$: "BINARY";
        data: string;
    }

    interface ReqlError extends Error { }
    
    /**
     * An error has occurred within the driver. This may be a driver bug, or it may
     * be an unfulfillable command, such as an unserializable query.
     *
     * See https://www.rethinkdb.com/docs/error-types/
     */
    interface ReqlDriverError extends ReqlError { }

    module Error {
      abstract class ReqlError implements Error {
        name: string;
        message: string;
        msg: string;
        stack?: string;
      }

      class ReqlNonExistenceError extends ReqlError { }
    }
}
