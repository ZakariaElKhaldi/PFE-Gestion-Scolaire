import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper for async route handlers to avoid try/catch blocks in every controller function
 * 
 * This utility wraps an async Express route handler and catches any errors that might be thrown,
 * passing them to Express's next() function so they are handled by the error middleware.
 * 
 * @param fn The async route handler function to wrap
 * @returns A function that handles the Promise rejection for Express
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 