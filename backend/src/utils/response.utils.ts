import { Response } from 'express';

/**
 * Standard success response format
 */
export interface SuccessResponse<T> {
  error: false;
  data: T;
  message?: string;
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: true;
  message: string;
  details?: any;
}

/**
 * Send a standardized success response
 * @param res Express response object
 * @param data Data to send in the response
 * @param message Optional success message
 * @param statusCode HTTP status code (default: 200)
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response<SuccessResponse<T>> => {
  return res.status(statusCode).json({
    error: false,
    data,
    ...(message && { message })
  });
};

/**
 * Send a standardized error response
 * @param res Express response object
 * @param message Error message
 * @param statusCode HTTP status code (default: 400)
 * @param details Optional additional error details
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  details?: any
): Response<ErrorResponse> => {
  return res.status(statusCode).json({
    error: true,
    message,
    ...(details && { details })
  });
};

/**
 * Send a created success response (201)
 * @param res Express response object
 * @param data Data of the created resource
 * @param message Optional success message
 */
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response<SuccessResponse<T>> => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send a no content response (204)
 * @param res Express response object
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send a bad request error response (400)
 * @param res Express response object
 * @param message Error message
 * @param details Optional additional error details
 */
export const sendBadRequest = (
  res: Response,
  message: string = 'Bad request',
  details?: any
): Response<ErrorResponse> => {
  return sendError(res, message, 400, details);
};

/**
 * Send an unauthorized error response (401)
 * @param res Express response object
 * @param message Error message
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): Response<ErrorResponse> => {
  return sendError(res, message, 401);
};

/**
 * Send a forbidden error response (403)
 * @param res Express response object
 * @param message Error message
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): Response<ErrorResponse> => {
  return sendError(res, message, 403);
};

/**
 * Send a not found error response (404)
 * @param res Express response object
 * @param message Error message
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): Response<ErrorResponse> => {
  return sendError(res, message, 404);
}; 

// ... votre code existant ...

export const sendServerError = (res: Response, message: string = 'Internal Server Error') => {
  return res.status(500).json({
    success: false,
    message,
    error: 'SERVER_ERROR'
  });
};
