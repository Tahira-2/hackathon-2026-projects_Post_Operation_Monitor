export interface ApiEnvelope<T> {
  result: T;
  isSuccess: boolean;
  statusCode: number;
  errorMessage: string[];
}

export interface ApiClientErrorShape {
  httpStatus: number;
  statusCode?: number;
  errors: string[];
}

export class ApiClientError extends Error {
  httpStatus: number;
  statusCode?: number;
  errors: string[];

  constructor(message: string, shape: ApiClientErrorShape) {
    super(message);
    this.name = 'ApiClientError';
    this.httpStatus = shape.httpStatus;
    this.statusCode = shape.statusCode;
    this.errors = shape.errors;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiClientError(error)) {
    if (error.errors.length > 0) {
      return error.errors[0];
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
