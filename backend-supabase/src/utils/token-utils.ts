import jwt from 'jsonwebtoken';
import { config } from '../config';
import { ApiError } from './ApiError';
import { UserRole, JwtPayload } from '../types/auth';

/**
 * Generate JWT token for a user
 */
export const generateToken = (userId: string, role: UserRole): string => {
  try {
    return jwt.sign(
      {
        userId,
        role,
      },
      config.jwt.secret as jwt.Secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  } catch (error) {
    throw ApiError.internal('Failed to generate authentication token');
  }
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.secret as jwt.Secret) as JwtPayload;
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