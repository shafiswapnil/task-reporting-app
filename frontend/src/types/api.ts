export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status: number;
    details?: unknown;
  };
}

