import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the submissions table
 */
export async function createSubmissionsTable(): Promise<void> {
  logger.db('Creating submissions table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS submissions (
      id VARCHAR(36) PRIMARY KEY,
      assignmentId VARCHAR(36) NOT NULL,
      studentId VARCHAR(36) NOT NULL,
      submissionText TEXT,
      fileUrl VARCHAR(500) NULL,
      submissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      grade INT NULL,
      feedback TEXT NULL,
      isLate BOOLEAN DEFAULT FALSE,
      status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_submission (assignmentId, studentId)
    )
  `;
  
  try {
    await query(sql);
    logger.db('Submissions table created or already exists');
  } catch (error) {
    logger.error('Failed to create submissions table', error);
    throw error;
  }
} 