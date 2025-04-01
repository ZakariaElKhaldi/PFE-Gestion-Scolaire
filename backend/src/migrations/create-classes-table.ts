import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the classes table
 */
export async function createClassesTable(): Promise<void> {
  logger.db('Creating classes table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(36) PRIMARY KEY,
      courseId VARCHAR(36) NOT NULL,
      teacherId VARCHAR(36) NOT NULL,
      room VARCHAR(50) NOT NULL,
      capacity INT NOT NULL DEFAULT 30,
      status ENUM('active', 'cancelled', 'completed') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_class_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_class_teacher FOREIGN KEY (teacherId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Classes table created or already exists');
  } catch (error) {
    logger.error('Failed to create classes table', error);
    throw error;
  }
} 