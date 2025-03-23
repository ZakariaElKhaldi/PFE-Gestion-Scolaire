import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { SystemSettings } from '../types/settings';

interface SystemSettingsRow extends SystemSettings, RowDataPacket {}

class SystemSettingsModel {
  /**
   * Create the system_settings table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        schoolName VARCHAR(100) NOT NULL,
        academicYear VARCHAR(20) NOT NULL,
        timezone VARCHAR(50) DEFAULT 'UTC',
        emailNotifications BOOLEAN DEFAULT true,
        defaultLanguage VARCHAR(20) DEFAULT 'english',
        maintenanceMode BOOLEAN DEFAULT false,
        maxStudentsPerClass INT DEFAULT 30,
        gradingSystem ENUM('letter', 'percentage', 'points') DEFAULT 'percentage',
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updatedBy VARCHAR(36),
        FOREIGN KEY (updatedBy) REFERENCES users(id)
      );
    `;
    await pool.query(query);
    
    // Insert default settings if none exist
    const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM system_settings');
    if (rows[0].count === 0) {
      await this.insertDefaultSettings();
    }
  }

  /**
   * Insert default system settings
   */
  private async insertDefaultSettings(): Promise<void> {
    const query = `
      INSERT INTO system_settings (
        schoolName, 
        academicYear, 
        timezone, 
        emailNotifications, 
        defaultLanguage, 
        maintenanceMode, 
        maxStudentsPerClass, 
        gradingSystem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query(query, [
      'School Management System',
      '2023-2024',
      'UTC',
      true,
      'english',
      false,
      30,
      'percentage'
    ]);
  }

  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings | null> {
    const [rows] = await pool.query<SystemSettingsRow[]>('SELECT * FROM system_settings ORDER BY id DESC LIMIT 1');
    return rows.length ? rows[0] : null;
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: Partial<SystemSettings>, updatedBy: string): Promise<boolean> {
    // Get current settings
    const currentSettings = await this.getSettings();
    if (!currentSettings) return false;
    
    // Build update query
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(settings).forEach(([key, value]) => {
      if (value !== undefined && key in currentSettings) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    // Add updatedBy
    fields.push('updatedBy = ?');
    values.push(updatedBy);
    
    const query = `UPDATE system_settings SET ${fields.join(', ')} WHERE id = ?`;
    values.push(currentSettings.id);
    
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }
}

export const systemSettingsModel = new SystemSettingsModel(); 