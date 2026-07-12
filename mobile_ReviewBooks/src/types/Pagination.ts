export interface Pagination {
  requestedPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  offset: number;
  hasPagination: boolean;
  hasPrevious: boolean;
  hasNext: boolean;
  isOutOfRange: boolean;
}
