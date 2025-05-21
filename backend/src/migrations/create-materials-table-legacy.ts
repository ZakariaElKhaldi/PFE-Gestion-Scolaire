import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the materials table
 */
export async function createMaterialsTable(): Promise<void> {
  logger.db('Creating materials table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS materials (
      id VARCHAR(36) PRIMARY KEY,
      courseId VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      type ENUM('document', 'video', 'link') NOT NULL,
      url VARCHAR(255) NOT NULL,
      uploadedBy VARCHAR(36) NOT NULL,
      uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      size INT DEFAULT NULL,
      duration INT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_material_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_material_uploader FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Materials table created or already exists');
  } catch (error) {
    logger.error('Failed to create materials table', error);
    throw error;
  }
} 