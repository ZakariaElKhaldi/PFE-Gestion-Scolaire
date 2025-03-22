import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the grades table
 */
export async function createGradesTable(): Promise<void> {
  logger.db('Creating grades table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS grades (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      courseId VARCHAR(36) NOT NULL,
      assignmentId VARCHAR(36) DEFAULT NULL,
      value DECIMAL(5, 2) NOT NULL,
      type ENUM('assignment', 'midterm', 'final', 'participation') NOT NULL,
      gradedBy VARCHAR(36) NOT NULL,
      gradedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      comments TEXT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_grade_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_grade_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_grade_assignment FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE SET NULL,
      CONSTRAINT fk_grade_grader FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Grades table created or already exists');
  } catch (error) {
    logger.error('Failed to create grades table', error);
    throw error;
  }
} 