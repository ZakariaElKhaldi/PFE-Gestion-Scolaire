import { pool } from '../config/database';
import { logger } from '../utils/logger';
import { userModel } from '../models/user.model';

// Maximum allowed failed attempts before account gets locked
const MAX_FAILED_ATTEMPTS = 5;

// Time in minutes to keep the account locked
const LOCK_DURATION_MINUTES = 15;

class LoginAttemptsService {
  /**
   * Record a login attempt for a user
   * @param email The email of the user attempting to login
   * @param ipAddress The IP address where the attempt originated from
   * @returns The number of failed attempts for this user
   */
  async recordAttempt(email: string, ipAddress: string): Promise<number> {
    try {
      logger.info(`Recording login attempt for ${email} from IP ${ipAddress}`);
      
      // Get the user
      const user = await userModel.findByEmail(email);
      
      // If user doesn't exist, we don't record anything but return a fake count
      // This prevents user enumeration
      if (!user) {
        logger.info(`No user found with email ${email}, returning fake attempt count`);
        return Math.floor(Math.random() * 3); // Return random number between 0-2
      }
      
      // Record the attempt in database
      const connection = await pool.getConnection();
      try {
        // Insert login attempt record
        await connection.execute(
          `INSERT INTO login_attempts (userId, email, ipAddress, attemptTime, successful)
           VALUES (?, ?, ?, NOW(), FALSE)`,
          [user.id, email, ipAddress]
        );
        
        // Increment failed login attempts counter
        await connection.execute(
          `UPDATE users SET failedLoginAttempts = failedLoginAttempts + 1 WHERE id = ?`,
          [user.id]
        );
        
        // Get updated user to check attempt count
        const [rows] = await connection.execute(
          `SELECT failedLoginAttempts FROM users WHERE id = ?`,
          [user.id]
        );
        
        if (Array.isArray(rows) && rows.length > 0) {
          const failedAttempts = (rows[0] as any).failedLoginAttempts;
          
          // Lock account if too many failed attempts
          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            logger.warn(`Locking account for ${email} after ${failedAttempts} failed attempts`);
            await connection.execute(
              `UPDATE users SET accountLocked = TRUE WHERE id = ?`,
              [user.id]
            );
            
            // Schedule unlock after lock duration
            // In a production app, you'd use a job scheduler
            setTimeout(async () => {
              await this.unlockAccount(user.id);
            }, LOCK_DURATION_MINUTES * 60 * 1000);
          }
          
          return failedAttempts;
        }
        
        return 1; // Default to 1 if we couldn't get the count
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('Error recording login attempt:', error);
      return 0; // Default value on error
    }
  }
  
  /**
   * Reset the failed attempts counter after a successful login
   * @param email The email of the user who successfully logged in
   */
  async resetAttempts(email: string): Promise<void> {
    try {
      const user = await userModel.findByEmail(email);
      if (!user) return;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          `UPDATE users SET 
           failedLoginAttempts = 0,
           accountLocked = FALSE,
           lastLoginAt = NOW()
           WHERE id = ?`,
          [user.id]
        );
        
        // Record successful login
        await connection.execute(
          `INSERT INTO login_attempts (userId, email, ipAddress, attemptTime, successful)
           VALUES (?, ?, 'N/A', NOW(), TRUE)`,
          [user.id, email]
        );
        
        logger.info(`Reset login attempts counter for ${email} after successful login`);
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('Error resetting login attempts:', error);
    }
  }
  
  /**
   * Unlock a user account that was locked due to too many failed attempts
   * @param userId The ID of the user whose account should be unlocked
   */
  async unlockAccount(userId: string): Promise<void> {
    try {
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          `UPDATE users SET 
           accountLocked = FALSE,
           failedLoginAttempts = 0
           WHERE id = ?`,
          [userId]
        );
        
        logger.info(`Unlocked account for user ${userId}`);
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error(`Error unlocking account for user ${userId}:`, error);
    }
  }
}

export const loginAttemptsService = new LoginAttemptsService();
export default loginAttemptsService; 