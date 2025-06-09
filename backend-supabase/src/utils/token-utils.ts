import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from './ApiError';
import { UserRole, JwtPayload } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string, role: UserRole): string => {
  try {
    const payload: JwtPayload = {
      userId,
      role,
    };
    
    return jwt.sign(
      payload,
      config.jwt.secret as Secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  } catch (error) {
    throw ApiError.internal('Failed to generate authentication token');
  }
};

/**
 * Generate a verification token for email verification
 */
export const generateVerificationToken = (): string => {
  // Using UUID v4 for secure random token
  return uuidv4();
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token expired');
    }
    throw ApiError.unauthorized('Invalid token');
  }
};

/**
 * Extract token from authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication required');
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }
  
  return token;
}; 