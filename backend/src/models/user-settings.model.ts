import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserSettings } from '../types/settings';

interface UserSettingsRow extends UserSettings, RowDataPacket {}

class UserSettingsModel {
  /**
   * Create the user_settings table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS user_settings (
        userId VARCHAR(36) PRIMARY KEY,
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(20) DEFAULT 'english',
        emailNotifications BOOLEAN DEFAULT true,
        pushNotifications BOOLEAN DEFAULT false,
        smsNotifications BOOLEAN DEFAULT false,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(query);
  }

  /**
   * Find settings by user ID
   */
  async findByUserId(userId: string): Promise<UserSettings | null> {
    const [rows] = await pool.query<UserSettingsRow[]>(
      'SELECT * FROM user_settings WHERE userId = ?',
      [userId]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Create or update user settings
   */
  async createOrUpdate(settings: UserSettings): Promise<boolean> {
    const query = `
      INSERT INTO user_settings (userId, theme, language, emailNotifications, pushNotifications, smsNotifications)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        theme = VALUES(theme),
        language = VALUES(language),
        emailNotifications = VALUES(emailNotifications),
        pushNotifications = VALUES(pushNotifications),
        smsNotifications = VALUES(smsNotifications)
    `;
    
    const [result] = await pool.query<ResultSetHeader>(query, [
      settings.userId,
      settings.theme,
      settings.language,
      settings.emailNotifications,
      settings.pushNotifications,
      settings.smsNotifications
    ]);
    
    return result.affectedRows > 0;
  }

  /**
   * Delete user settings
   */
  async delete(userId: string): Promise<boolean> {
    const query = 'DELETE FROM user_settings WHERE userId = ?';
    const [result] = await pool.query<ResultSetHeader>(query, [userId]);
    
    return result.affectedRows > 0;
  }
}

export const userSettingsModel = new UserSettingsModel(); 