import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { SecuritySettings } from '../types/settings';

interface SecuritySettingsRow extends SecuritySettings, RowDataPacket {}

class SecuritySettingsModel {
  /**
   * Create the security_settings table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS security_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        requireTwoFactor BOOLEAN DEFAULT false,
        passwordExpiryDays INT DEFAULT 90,
        sessionTimeout INT DEFAULT 30,
        allowedIpRanges JSON,
        maxLoginAttempts INT DEFAULT 5,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updatedBy VARCHAR(36),
        FOREIGN KEY (updatedBy) REFERENCES users(id)
      );
    `;
    await pool.query(query);
    
    // Insert default settings if none exist
    const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM security_settings');
    if (rows[0].count === 0) {
      await this.insertDefaultSettings();
    }
  }

  /**
   * Insert default security settings
   */
  private async insertDefaultSettings(): Promise<void> {
    const query = `
      INSERT INTO security_settings (
        requireTwoFactor,
        passwordExpiryDays,
        sessionTimeout,
        allowedIpRanges,
        maxLoginAttempts
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      false,
      90,
      30,
      JSON.stringify(['*']), // Allow all IPs by default
      5
    ]);
  }

  /**
   * Get security settings
   */
  async getSettings(): Promise<SecuritySettings | null> {
    const [rows] = await pool.query<SecuritySettingsRow[]>('SELECT * FROM security_settings ORDER BY id DESC LIMIT 1');
    
    if (!rows.length) return null;
    
    // Parse JSON fields
    const settings = rows[0];
    if (typeof settings.allowedIpRanges === 'string') {
      settings.allowedIpRanges = JSON.parse(settings.allowedIpRanges as string);
    }
    
    return settings;
  }

  /**
   * Update security settings
   */
  async updateSettings(settings: Partial<SecuritySettings>, updatedBy: string): Promise<boolean> {
    // Get current settings
    const currentSettings = await this.getSettings();
    if (!currentSettings) return false;
    
    // Build update query
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined && key in currentSettings) {
        if (key === 'allowedIpRanges' && Array.isArray(value)) {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    if (fields.length === 0) return false;
    
    // Add updatedBy
    fields.push('updatedBy = ?');
    values.push(updatedBy);
    
    const query = `UPDATE security_settings SET ${fields.join(', ')} WHERE id = ?`;
    values.push(currentSettings.id);
    
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }
}

export const securitySettingsModel = new SecuritySettingsModel(); 