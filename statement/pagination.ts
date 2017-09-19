
import { Request } from "express";
import { StatusError } from "./status.error";

export interface IPagedResults<T> {
  totalCount: number;
  totalPages: number;
  page: number;
  results: T[];    
}

export type PageOptions = { page?: any, pageSize?: any };

export const extractPagination = (req: Request): PageOptions => {
  let { page, pageSize } = req.query;
  return { page, pageSize };
}

export const validPageOptions = (options: PageOptions): boolean => options.page || options.pageSize;

export const paginateResults = <TModel>(models: TModel[]) => {
  return (options: PageOptions): IPagedResults<TModel> => {
    let results = models;
    let { page, pageSize } = options;
    
    page = parseInt(page) || 1;
    pageSize = parseInt(pageSize) || 10;
  
    let count = results.length;
    let totalPages = Math.ceil(count / pageSize);
  
    if (page > totalPages) {
      throw new StatusError(400, "Invalid page number");
    }
  
    results = results.slice((page - 1) * pageSize, page * pageSize);
    
    return {
      totalCount: count,
      totalPages: totalPages,
      page: page,
      results: results
    };
  }
}
