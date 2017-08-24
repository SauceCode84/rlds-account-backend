
export interface IPagedResults<T> {
  totalCount: number;
  totalPages: number;
  page: number;
  results: T[];    
}

export type PageOptions = { page?: any, pageSize?: any };
