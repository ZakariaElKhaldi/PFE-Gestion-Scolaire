import { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload, UserRole } from '../types/auth';

// Extend Express Request to include user information
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: true, message: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: true, message: 'Authentication required' });
      return;
    }
    
    // Verify the token
    const decoded = jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
    
    // Attach the user information to the request object
    req.user = decoded;
    
    // For student users, add the studentId field if it's not present
    if (req.user.role === 'student' && !req.user.studentId) {
      req.user.studentId = req.user.userId;
      console.log('Adding missing studentId to student user, using userId:', req.user.userId);
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: true, message: 'Invalid or expired token' });
  }
};

// Authorization middleware
export const authorize = (roles: UserRole[] | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: true, message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: true, message: 'Unauthorized access' });
      return;
    }

    next();
  };
}; 