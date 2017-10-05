
import { Request } from "express";
import { StatusError } from "./status.error";

export interface PagedResults<T> {
  totalCount: number;
  totalPages: number;
  page: number;
  results: T[];    
}

export interface PageOptions {
  page?: any;
  pageSize?: any;
};

export const extractPagination = (req: Request, useDefaults: boolean = true): PageOptions => {
  let { page, pageSize } = req.query;
  return { page, pageSize };
}

export const validPageOptions = (options: PageOptions): boolean => options.page || options.pageSize;

type QueryFunction<TModel> = () => TModel[] | Promise<TModel[]>;
type CountFunction = () => number | Promise<number>;

export const paginateResults = async <TModel>(queryFn: QueryFunction<TModel>, countFn: CountFunction, options: PageOptions): Promise<PagedResults<TModel>> => {
  let results = await Promise.resolve(queryFn());
  let totalCount = await Promise.resolve(countFn());
  let { page, pageSize } = options;
  
  page = parseInt(page) || 1;
  pageSize = parseInt(pageSize) || 10;

  let totalPages = Math.ceil(totalCount / pageSize);

  if (page > totalPages) {
    throw new StatusError(400, "Invalid page number");
  }
  
  return {
    totalCount,
    totalPages,
    page,
    results
  };  
}
