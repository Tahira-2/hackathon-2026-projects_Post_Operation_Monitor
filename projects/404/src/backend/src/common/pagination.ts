import { Pagination, PaginationParams } from './types/pagination.types';

export const normalizePagination = (
  params: PaginationParams,
  options: { defaultPageSize?: number; maxPageSize?: number } = {},
): Pagination => {
  const defaultPageSize = options.defaultPageSize ?? 20;
  const maxPageSize = options.maxPageSize ?? 100;
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, Math.floor(params.pageSize ?? defaultPageSize)),
  );
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { page, pageSize, skip, take };
};
