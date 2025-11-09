/**
 * PaginatedResponse
 * 
 * Generic interface for paginated API responses
 * Provides metadata about pagination along with the data
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
