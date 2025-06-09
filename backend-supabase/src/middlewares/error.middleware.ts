import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Async handler to catch errors in async routes
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.originalUrl}`));
};

/**
 * Global error handler
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  
  // Handle ApiError instances
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  
  // Handle Supabase errors
  if (err?.error?.message) {
    message = err.error.message;
    statusCode = err.error.statusCode || 500;
    isOperational = true;
  }
  
  // Handle validation errors
  if (err?.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
    isOperational = true;
  }
  
  // Log error
  if (statusCode >= 500) {
    logger.error(`Server Error: ${message}`, {
      path: req.path,
      method: req.method,
      statusCode,
      stack: err.stack,
    });
  } else if (statusCode >= 400) {
    logger.warn(`Client Error: ${message}`, {
      path: req.path,
      method: req.method,
      statusCode,
    });
  }
  
  // Send response
  res.status(statusCode).json({
    error: true,
    message,
    ...(config.server.env === 'development' && !isOperational ? { stack: err.stack } : {}),
  });
}; 