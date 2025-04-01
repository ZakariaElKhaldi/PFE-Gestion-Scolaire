import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth';

/**
 * Role-based authorization middleware
 * 
 * This middleware checks if the authenticated user has the required role(s)
 * to access the requested resource. It should be used after the authenticate
 * middleware to ensure the user is first authenticated.
 * 
 * @param roles Array of roles allowed to access the resource
 * @returns Express middleware function
 */
export const authorize = (roles: UserRole[] | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ 
        error: true, 
        message: 'Authentication required before checking authorization' 
      });
      return;
    }

    // Check if user has the required role
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: true, 
        message: `Access denied. Required role: ${roles.join(' or ')}, your role: ${req.user.role}` 
      });
      return;
    }

    // User is authorized, proceed to the next middleware or route handler
    next();
  };
};

/**
 * Middleware to check if the authenticated user is an administrator
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: true, message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'administrator') {
    res.status(403).json({ error: true, message: 'Administrator access required' });
    return;
  }

  next();
};

/**
 * Middleware to check if the authenticated user is a teacher
 */
export const isTeacher = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: true, message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'teacher') {
    res.status(403).json({ error: true, message: 'Teacher access required' });
    return;
  }

  next();
};

/**
 * Middleware to check if the authenticated user is a student
 */
export const isStudent = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: true, message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'student') {
    res.status(403).json({ error: true, message: 'Student access required' });
    return;
  }

  next();
};

/**
 * Middleware to check if the authenticated user is a parent
 */
export const isParent = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: true, message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'parent') {
    res.status(403).json({ error: true, message: 'Parent access required' });
    return;
  }

  next();
}; 