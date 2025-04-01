import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Generate a JWT token for a user
 * @param userId The user ID
 * @param role Optional user role
 */
export function generateToken(userId: string, role?: string): string {
  // Create a token with user ID and role
  const payload = {
    userId,
    id: userId,
    role
  };
  
  // Sign token with 24h expiration
  return jwt.sign(payload, config.jwt.secret, { 
    expiresIn: '24h' 
  });
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
} 