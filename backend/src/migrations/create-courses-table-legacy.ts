import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the courses table
 */
export async function createCoursesTable(): Promise<void> {
  logger.db('Creating courses table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS courses (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      code VARCHAR(50) UNIQUE,
      credits INT,
      departmentId VARCHAR(36),
      teacherId VARCHAR(36),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE SET NULL
    )
  `;
  
  try {
    await query(sql);
    logger.db('Courses table created or already exists');
  } catch (error) {
    logger.error('Failed to create courses table', error);
    throw error;
  }
} 