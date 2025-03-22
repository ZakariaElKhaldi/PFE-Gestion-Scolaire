import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the parent_child table
 */
export async function createParentChildTable(): Promise<void> {
  logger.db('Creating parent_child table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS parent_child (
      id VARCHAR(36) PRIMARY KEY,
      parentId VARCHAR(36) NOT NULL,
      studentId VARCHAR(36) NOT NULL,
      relationship ENUM('parent', 'guardian') NOT NULL DEFAULT 'parent',
      isEmergencyContact TINYINT(1) NOT NULL DEFAULT 0,
      canPickup TINYINT(1) NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_relationship (parentId, studentId),
      CONSTRAINT fk_parent_child_parent FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_parent_child_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Parent_child table created or already exists');
  } catch (error) {
    logger.error('Failed to create parent_child table', error);
    throw error;
  }
} 