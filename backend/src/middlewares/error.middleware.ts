import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware for Express
 * Catches and processes errors that occur synchronously and asynchronously
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If the response is already being sent, let Express handle it
  if (res.headersSent) {
    return next(err);
  }

  // Set status code (use existing code or default to 500)
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  console.error('Error occurred:', err);
  
  // Format the error response
  res.status(statusCode).json({
    error: true,
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

// 404 middleware for routes not found
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: true,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

/**
 * Async handler wrapper to avoid try/catch blocks in route handlers
 * This automatically catches errors and passes them to the next middleware
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}; 