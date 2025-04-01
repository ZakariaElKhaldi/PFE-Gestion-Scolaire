/**
 * Custom API Error class for standardized error responses
 */
export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: any[];
  
  constructor(message: string, status: number = 500, code?: string, errors?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
    
    // This is necessary for extending Error in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(message: string = 'Bad Request', code?: string, errors?: any[]): ApiError {
    return new ApiError(message, 400, code, errors);
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(message: string = 'Unauthorized', code?: string): ApiError {
    return new ApiError(message, 401, code);
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(message: string = 'Forbidden', code?: string): ApiError {
    return new ApiError(message, 403, code);
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(message: string = 'Resource not found', code?: string): ApiError {
    return new ApiError(message, 404, code);
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(message: string = 'Conflict', code?: string): ApiError {
    return new ApiError(message, 409, code);
  }

  /**
   * Create an Internal Server error (500)
   */
  static internal(message: string = 'Internal Server Error', code?: string): ApiError {
    return new ApiError(message, 500, code);
  }

  /**
   * Convert an error to ApiError format
   */
  static from(error: any): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    
    const message = error.message || 'Unknown error occurred';
    return new ApiError(message, 500);
  }
} 