import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the users table
 */
export async function createUsersTable(): Promise<void> {
  logger.db('Creating users table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      phoneNumber VARCHAR(20),
      role ENUM('admin', 'teacher', 'student', 'parent') NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await query(sql);
    logger.db('Users table created or already exists');
  } catch (error) {
    logger.error('Failed to create users table', error);
    throw error;
  }
} 