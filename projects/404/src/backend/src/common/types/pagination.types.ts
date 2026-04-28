export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};
