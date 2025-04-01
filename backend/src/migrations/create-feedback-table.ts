import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the feedback table
 */
export async function createFeedbackTable(): Promise<void> {
  logger.db('Creating feedback table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS feedback (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      courseId VARCHAR(36) NOT NULL,
      rating INT NOT NULL,
      comment TEXT NOT NULL,
      submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending', 'reviewed') NOT NULL DEFAULT 'pending',
      teacherResponse TEXT DEFAULT NULL,
      teacherResponseDate DATETIME DEFAULT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_feedback_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_feedback_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  try {
    await query(sql);
    logger.db('Feedback table created or already exists');
  } catch (error) {
    logger.error('Failed to create feedback table', error);
    throw error;
  }
} 