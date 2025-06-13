import { pool } from '../config/database';
import { logger } from '../utils/logger';

/**
 * Migration to update emailVerified field for all users to TRUE
 */
export async function updateEmailVerifiedDefault(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    logger.info('Starting migration: Setting emailVerified to TRUE for all existing users');
    
    // Update the emailVerified column for all users
    await connection.execute(`
      UPDATE users 
      SET emailVerified = TRUE 
      WHERE emailVerified IS NULL OR emailVerified = FALSE;
    `);
    
    // Update the default value for future inserts
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN emailVerified BOOLEAN DEFAULT TRUE;
    `);
    
    logger.info('Successfully updated emailVerified field for all users');
  } catch (error) {
    logger.error('Error updating emailVerified field:', error);
    throw error;
  } finally {
    connection.release();
    logger.info('Database connection released');
  }
} 