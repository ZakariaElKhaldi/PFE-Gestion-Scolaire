import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { UserRole } from '../types/auth';

export class SettingsController {
  /**
   * Get user settings
   */
  async getUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }
      
      const settings = await settingsService.getUserSettings(userId);
      
      // Return in a format the frontend expects
      res.status(200).json({
        error: false,
        data: settings, // Return settings directly instead of nested in an object
        message: 'Settings retrieved successfully',
      });
    } catch (error: any) {
      console.error('Error retrieving user settings:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve settings',
      });
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }
      
      const settings = await settingsService.updateUserSettings(userId, req.body);
      
      if (!settings) {
        return res.status(400).json({
          error: true,
          message: 'Failed to update settings',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { settings },
        message: 'Settings updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to update settings',
      });
    }
  }

  /**
   * Get system settings (admin only)
   */
  async getSystemSettings(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'administrator') {
        return res.status(403).json({
          error: true,
          message: 'Forbidden: Admin access required',
        });
      }
      
      const settings = await settingsService.getSystemSettings();
      
      if (!settings) {
        return res.status(404).json({
          error: true,
          message: 'System settings not found',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { settings },
        message: 'System settings retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve system settings',
      });
    }
  }

  /**
   * Update system settings (admin only)
   */
  async updateSystemSettings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      // Check if user is admin
      if (req.user?.role !== 'administrator' || !userId) {
        return res.status(403).json({
          error: true,
          message: 'Forbidden: Admin access required',
        });
      }
      
      const settings = await settingsService.updateSystemSettings(req.body, userId);
      
      if (!settings) {
        return res.status(400).json({
          error: true,
          message: 'Failed to update system settings',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { settings },
        message: 'System settings updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to update system settings',
      });
    }
  }

  /**
   * Get security settings (admin only)
   */
  async getSecuritySettings(req: Request, res: Response) {
    try {
      // Check if user is admin
      if (req.user?.role !== 'administrator') {
        return res.status(403).json({
          error: true,
          message: 'Forbidden: Admin access required',
        });
      }
      
      const settings = await settingsService.getSecuritySettings();
      
      if (!settings) {
        return res.status(404).json({
          error: true,
          message: 'Security settings not found',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { settings },
        message: 'Security settings retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve security settings',
      });
    }
  }

  /**
   * Update security settings (admin only)
   */
  async updateSecuritySettings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      // Check if user is admin
      if (req.user?.role !== 'administrator' || !userId) {
        return res.status(403).json({
          error: true,
          message: 'Forbidden: Admin access required',
        });
      }
      
      const settings = await settingsService.updateSecuritySettings(req.body, userId);
      
      if (!settings) {
        return res.status(400).json({
          error: true,
          message: 'Failed to update security settings',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { settings },
        message: 'Security settings updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to update security settings',
      });
    }
  }
}

export const settingsController = new SettingsController(); 