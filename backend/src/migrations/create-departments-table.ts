import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the departments table
 */
export async function createDepartmentsTable(): Promise<void> {
  logger.db('Creating departments table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS departments (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      code VARCHAR(10) NOT NULL UNIQUE,
      headId VARCHAR(36) DEFAULT NULL,
      description TEXT NOT NULL,
      established DATE NOT NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_department_head FOREIGN KEY (headId) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Departments table created or already exists');
  } catch (error) {
    logger.error('Failed to create departments table', error);
    throw error;
  }
} 