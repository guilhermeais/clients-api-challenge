export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  pages: number;
  limit: number;
  currentPage: number;
};

export type PaginatedRequest<OtherFilters = unknown> = {
  page: number;
  limit: number;
} & OtherFilters;
