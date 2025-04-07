export interface ResponseMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: ResponseMeta;
  data: T | null;
}
