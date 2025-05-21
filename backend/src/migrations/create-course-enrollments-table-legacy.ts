import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the course enrollments table
 */
export async function createCourseEnrollmentsTable(): Promise<void> {
  logger.db('Creating course enrollments table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS course_enrollments (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      courseId VARCHAR(36) NOT NULL,
      status ENUM('pending', 'active', 'completed', 'dropped') NOT NULL DEFAULT 'pending',
      enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completionDate TIMESTAMP NULL,
      grade VARCHAR(5) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE KEY unique_enrollment (studentId, courseId)
    )
  `;
  
  try {
    await query(sql);
    logger.db('Course enrollments table created or already exists');
  } catch (error) {
    logger.error('Failed to create course enrollments table', error);
    throw error;
  }
} 