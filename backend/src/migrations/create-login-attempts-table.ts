import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Run migration to create the login_attempts table for tracking login security
 */
export async function createLoginAttemptsTable(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    logger.info('Starting migration: Creating login_attempts table');
    
    // Check if table already exists
    const [tables] = await connection.execute(
      `SHOW TABLES LIKE 'login_attempts'`
    );
    
    if (Array.isArray(tables) && tables.length > 0) {
      logger.info('Migration already applied. login_attempts table already exists.');
      return;
    }
    
    // Create the table
    await connection.execute(`
      CREATE TABLE login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        ipAddress VARCHAR(45) NOT NULL,
        attemptTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        successful BOOLEAN NOT NULL DEFAULT FALSE,
        INDEX (userId),
        INDEX (email),
        INDEX (ipAddress),
        INDEX (attemptTime)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
    
    logger.info('Successfully created login_attempts table');
  } catch (error) {
    logger.error('Error creating login_attempts table:', error);
    throw error;
  } finally {
    connection.release();
    logger.info('Database connection released');
  }
} 