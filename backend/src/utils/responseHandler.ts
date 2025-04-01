/**
 * This file re-exports the response utilities from response.utils.ts
 * It exists to maintain backward compatibility with imports like:
 * import { sendSuccess, sendError, ... } from '../utils/responseHandler';
 */

export {
  sendSuccess,
  sendError,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  SuccessResponse,
  ErrorResponse
} from './response.utils';

// Additional server error handler that might be imported by controllers
export const sendServerError = (
  res: any,
  message: string = 'Internal server error',
  details?: any
) => {
  return res.status(500).json({
    error: true,
    message,
    ...(details && { details })
  });
}; 