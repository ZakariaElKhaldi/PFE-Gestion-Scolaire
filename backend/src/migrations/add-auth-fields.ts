import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Run migration to add additional authentication fields to the users table
 */
export async function addAuthFields(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    logger.info('Starting migration: Adding authentication fields to users table');
    
    // Check if the columns already exist
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM users LIKE 'emailVerified'`
    );
    
    if (Array.isArray(columns) && columns.length > 0) {
      logger.info('Migration already applied. Auth fields already exist.');
      return;
    }
    
    // Add the new columns
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN emailVerified BOOLEAN DEFAULT FALSE,
      ADD COLUMN accountLocked BOOLEAN DEFAULT FALSE,
      ADD COLUMN accountSuspended BOOLEAN DEFAULT FALSE,
      ADD COLUMN lastLoginAt TIMESTAMP NULL,
      ADD COLUMN failedLoginAttempts INT DEFAULT 0;
    `);
    
    logger.info('Successfully added authentication fields to users table');
  } catch (error) {
    logger.error('Error adding authentication fields to users table:', error);
    throw error;
  } finally {
    connection.release();
    logger.info('Database connection released');
  }
} 