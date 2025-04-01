import { Request, Response } from 'express';
import { userService, UserFilters } from '../services/user.service';

class UserController {
  /**
   * Get all users
   */
  async getUsers(req: Request, res: Response) {
    try {
      const filters: UserFilters = {
        role: req.query.role as any,
        search: req.query.search as string,
      };
      
      const users = await userService.getUsers(filters);
      
      res.status(200).json({
        error: false,
        data: { users },
        message: 'Users retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve users',
      });
    }
  }

  /**
   * Get a single user
   */
  async getUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      
      const user = await userService.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { user },
        message: 'User retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve user',
      });
    }
  }

  /**
   * Update a user
   */
  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const userData = req.body;
      
      const user = await userService.updateUser(userId, userData);
      
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found or could not be updated',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { user },
        message: 'User updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      
      const deleted = await userService.deleteUser(userId);
      
      if (!deleted) {
        return res.status(404).json({
          error: true,
          message: 'User not found or could not be deleted',
        });
      }
      
      res.status(200).json({
        error: false,
        message: 'User deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to delete user',
      });
    }
  }

  /**
   * Update user password
   */
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const { currentPassword, newPassword } = req.body;
      
      // Ensure the authenticated user is updating their own password
      if (req.user?.userId !== userId) {
        return res.status(403).json({
          error: true,
          message: 'Unauthorized to update this user\'s password',
        });
      }
      
      const updated = await userService.updatePassword(userId, currentPassword, newPassword);
      
      if (!updated) {
        return res.status(400).json({
          error: true,
          message: 'Failed to update password',
        });
      }
      
      res.status(200).json({
        error: false,
        message: 'Password updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to update password',
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }
      
      const user = await userService.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { user },
        message: 'Profile retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve profile',
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          error: true,
          message: 'Unauthorized',
        });
      }
      
      // Only allow certain fields to be updated via profile
      const { firstName, lastName, phoneNumber, bio } = req.body;
      
      const profileData = {
        firstName,
        lastName,
        phoneNumber,
        bio
      };
      
      const user = await userService.updateUser(userId, profileData);
      
      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'User not found or could not be updated',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { user },
        message: 'Profile updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to update profile',
      });
    }
  }
}

export const userController = new UserController(); 