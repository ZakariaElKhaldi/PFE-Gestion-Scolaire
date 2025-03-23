import { userSettingsModel } from '../models/user-settings.model';
import { systemSettingsModel } from '../models/system-settings.model';
import { securitySettingsModel } from '../models/security-settings.model';
import { 
  UserSettings, 
  UserSettingsResponse, 
  SystemSettings, 
  SecuritySettings 
} from '../types/settings';

export class SettingsService {
  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettingsResponse> {
    const settings = await userSettingsModel.findByUserId(userId);
    
    if (!settings) {
      // Return default settings if none exist
      return {
        userId,
        theme: 'light',
        language: 'english',
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false
      };
    }
    
    return settings;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<UserSettingsResponse | null> {
    // Get current settings or defaults
    const currentSettings = await this.getUserSettings(userId);
    
    // Merge with new settings
    const updatedSettings: UserSettings = {
      ...currentSettings,
      ...settings,
      userId // Ensure userId is set correctly
    };
    
    // Save to database
    const updated = await userSettingsModel.createOrUpdate(updatedSettings);
    
    if (!updated) return null;
    
    // Return updated settings
    return this.getUserSettings(userId);
  }

  /**
   * Get system settings (admin only)
   */
  async getSystemSettings(): Promise<SystemSettings | null> {
    return systemSettingsModel.getSettings();
  }

  /**
   * Update system settings (admin only)
   */
  async updateSystemSettings(settings: Partial<SystemSettings>, updatedBy: string): Promise<SystemSettings | null> {
    const updated = await systemSettingsModel.updateSettings(settings, updatedBy);
    
    if (!updated) return null;
    
    return this.getSystemSettings();
  }

  /**
   * Get security settings (admin only)
   */
  async getSecuritySettings(): Promise<SecuritySettings | null> {
    return securitySettingsModel.getSettings();
  }

  /**
   * Update security settings (admin only)
   */
  async updateSecuritySettings(settings: Partial<SecuritySettings>, updatedBy: string): Promise<SecuritySettings | null> {
    const updated = await securitySettingsModel.updateSettings(settings, updatedBy);
    
    if (!updated) return null;
    
    return this.getSecuritySettings();
  }

  /**
   * Initialize all settings tables
   */
  async initializeTables(): Promise<void> {
    await userSettingsModel.createTable();
    await systemSettingsModel.createTable();
    await securitySettingsModel.createTable();
  }
}

export const settingsService = new SettingsService(); 