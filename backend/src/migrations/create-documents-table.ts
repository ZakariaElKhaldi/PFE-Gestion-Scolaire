import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the documents table
 */
export async function createDocumentsTable(): Promise<void> {
  logger.db('Creating documents table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(36) PRIMARY KEY,
      userId VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      type VARCHAR(50) NOT NULL,
      url VARCHAR(255) NOT NULL,
      size INT NOT NULL,
      uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_document_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Documents table created or already exists');
  } catch (error) {
    logger.error('Failed to create documents table', error);
    throw error;
  }
} 