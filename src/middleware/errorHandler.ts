import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  code?: string;
}

export function errorHandler(
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error('API Error:', error);

  // Default error response
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  let code = error.code || 'INTERNAL_ERROR';

  // Handle specific Supabase/PostgreSQL errors
  if (error.message.includes('duplicate key value violates unique constraint')) {
    status = 409;
    code = 'DUPLICATE_NAME';
    message = 'A node with this name already exists under the specified parent';
  } else if (error.message.includes('violates foreign key constraint')) {
    status = 404;
    code = 'PARENT_NOT_FOUND';
    message = 'Parent node not found';
  } else if (error.message.includes('Node not found')) {
    status = 404;
    code = 'NODE_NOT_FOUND';
    message = 'Node not found';
  } else if (error.message.includes('Root node not found')) {
    status = 404;
    code = 'ROOT_NODE_NOT_FOUND';
    message = 'Root node not found';
  } else if (error.message.includes('Invalid path')) {
    status = 400;
    code = 'INVALID_PATH';
    message = 'Invalid path format';
  } else if (error.message.includes('cannot have child elements')) {
    status = 404;
    code = 'PROPERTY_PATH_ERROR';
    message = error.message; // Keep the original message as it's descriptive
  }

  res.status(status).json({
    error: code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

export function createApiError(message: string, status: number, code?: string): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.code = code;
  return error;
}
