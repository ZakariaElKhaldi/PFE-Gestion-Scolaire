import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the assignments table
 */
export async function createAssignmentsTable(): Promise<void> {
  logger.db('Creating assignments table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS assignments (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      courseId VARCHAR(36) NOT NULL,
      dueDate TIMESTAMP NOT NULL,
      totalPoints INT NOT NULL DEFAULT 100,
      isPublished BOOLEAN DEFAULT FALSE,
      attachmentUrl VARCHAR(500) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    )
  `;
  
  try {
    await query(sql);
    logger.db('Assignments table created or already exists');
  } catch (error) {
    logger.error('Failed to create assignments table', error);
    throw error;
  }
} 