import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Define common error types for consistent handling
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE_ERROR',
  SERVER = 'SERVER_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  INPUT = 'INPUT_ERROR',
}

// Extended Error class with additional properties
export class AppError extends Error {
  statusCode: number;
  type: ErrorType;
  details?: any;

  constructor(message: string, statusCode: number, type: ErrorType, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static validation(message: string, details?: any): AppError {
    return new AppError(message, 400, ErrorType.VALIDATION, details);
  }

  static authentication(message: string = 'Authentication required'): AppError {
    return new AppError(message, 401, ErrorType.AUTHENTICATION);
  }

  static authorization(message: string = 'You do not have permission to perform this action'): AppError {
    return new AppError(message, 403, ErrorType.AUTHORIZATION);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404, ErrorType.NOT_FOUND);
  }

  static conflict(message: string, details?: any): AppError {
    return new AppError(message, 409, ErrorType.CONFLICT, details);
  }

  static database(message: string, details?: any): AppError {
    return new AppError(message, 500, ErrorType.DATABASE, details);
  }

  static server(message: string = 'Internal server error', details?: any): AppError {
    return new AppError(message, 500, ErrorType.SERVER, details);
  }

  static externalService(message: string, details?: any): AppError {
    return new AppError(message, 502, ErrorType.EXTERNAL_SERVICE, details);
  }

  static input(message: string, details?: any): AppError {
    return new AppError(message, 400, ErrorType.INPUT, details);
  }
}

// Middleware to handle 404 errors
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Main error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errorType = err.type || ErrorType.SERVER;
  let details = err.details || undefined;
  
  // Handle validation errors from express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    errorType = ErrorType.VALIDATION;
    message = 'Validation error';
    details = err.array();
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = ErrorType.AUTHENTICATION;
    message = 'Token expired';
  }
  
  // Handle database-specific errors
  if (err.code) {
    if (err.code === 'ER_DUP_ENTRY') {
      statusCode = 409;
      errorType = ErrorType.CONFLICT;
      message = 'A record with this information already exists';
    } else if (err.code === 'ER_NO_REFERENCED_ROW') {
      statusCode = 400;
      errorType = ErrorType.VALIDATION;
      message = 'Referenced record does not exist';
    }
  }
  
  // Log error details based on severity
  if (statusCode >= 500) {
    logger.error(`[${errorType}] ${message}`, {
      path: req.path,
      method: req.method,
      error: err,
      ...(details && { details })
    });
  } else if (statusCode >= 400) {
    logger.warn(`[${errorType}] ${message}`, {
      path: req.path,
      method: req.method,
      ...(details && { details })
    });
  }
  
  // Send consistent error response
  res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack 
      })
    }
  });
};

// Helper middleware for async route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}; 