export interface IPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginationResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: IPagination;
}
