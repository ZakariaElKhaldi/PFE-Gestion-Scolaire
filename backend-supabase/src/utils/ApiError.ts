/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Create a 400 Bad Request error
   */
  static badRequest(message: string): ApiError {
    return new ApiError(400, message);
  }
  
  /**
   * Create a 401 Unauthorized error
   */
  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message);
  }
  
  /**
   * Create a 403 Forbidden error
   */
  static forbidden(message = 'Access denied'): ApiError {
    return new ApiError(403, message);
  }
  
  /**
   * Create a 404 Not Found error
   */
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }
  
  /**
   * Create a 409 Conflict error
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
  
  /**
   * Create a 422 Unprocessable Entity error
   */
  static validation(message: string): ApiError {
    return new ApiError(422, message);
  }
  
  /**
   * Create a 429 Too Many Requests error
   */
  static tooManyRequests(message = 'Too many requests, please try again later'): ApiError {
    return new ApiError(429, message);
  }
  
  /**
   * Create a 500 Internal Server Error
   */
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, false);
  }
  
  /**
   * Create a 503 Service Unavailable error
   */
  static serviceUnavailable(message = 'Service temporarily unavailable'): ApiError {
    return new ApiError(503, message, false);
  }
} 