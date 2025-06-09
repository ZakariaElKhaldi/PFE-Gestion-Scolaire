import { Request, Response } from 'express';
import { userModel } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { UserRole } from '../types/auth';
import { supabaseAdmin } from '../config/supabase';

class UserController {
  /**
   * Get all users with optional role filter
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.query;
      const users = await userModel.findAll(role as UserRole | undefined);
      
      res.status(200).json({
        error: false,
        data: { users }
      });
    } catch (error) {
      logger.error('Error getting users:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve users'
      });
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        error: false,
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error getting user by ID:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to retrieve user'
        });
      }
    }
  }

  /**
   * Update user profile
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        throw ApiError.notFound('User not found');
      }
      
      // Check authorization - users can only update their own profile unless they are admins
      if (req.user?.userId !== id && req.user?.role !== UserRole.ADMINISTRATOR) {
        throw ApiError.forbidden('You are not authorized to update this user');
      }
      
      // Remove fields that shouldn't be updated directly
      const { password, role, email, ...allowedUpdates } = updateData;
      
      // Update user
      const updated = await userModel.update(id, allowedUpdates);
      
      if (!updated) {
        throw ApiError.internal('Failed to update user');
      }
      
      // Get updated user
      const updatedUser = await userModel.findById(id);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser!;
      
      res.status(200).json({
        error: false,
        message: 'User updated successfully',
        data: { user: userWithoutPassword }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error updating user:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to update user'
        });
      }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      // Check authorization - users can only update their own password
      if (req.user?.userId !== id) {
        throw ApiError.forbidden('You are not authorized to update this password');
      }
      
      // Verify current password
      const isPasswordValid = await userModel.verifyPassword(currentPassword, user.password);
      if (!isPasswordValid) {
        throw ApiError.unauthorized('Current password is incorrect');
      }
      
      // Update password
      const updated = await userModel.updatePassword(id, newPassword);
      
      if (!updated) {
        throw ApiError.internal('Failed to update password');
      }
      
      res.status(200).json({
        error: false,
        message: 'Password updated successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error updating password:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to update password'
        });
      }
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      // Only admins can delete users
      if (req.user?.role !== UserRole.ADMINISTRATOR) {
        throw ApiError.forbidden('You are not authorized to delete users');
      }
      
      // Delete user
      const deleted = await userModel.delete(id);
      
      if (!deleted) {
        throw ApiError.internal('Failed to delete user');
      }
      
      res.status(200).json({
        error: false,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error deleting user:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to delete user'
        });
      }
    }
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file;
      
      if (!file) {
        throw ApiError.badRequest('No file uploaded');
      }
      
      // Check if user exists
      const user = await userModel.findById(id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      // Check authorization
      if (req.user?.userId !== id && req.user?.role !== UserRole.ADMINISTRATOR) {
        throw ApiError.forbidden('You are not authorized to update this user');
      }
      
      // Upload to Supabase Storage
      const fileName = `${id}-${Date.now()}-${file.originalname}`;
      const { data, error } = await supabaseAdmin.storage
        .from('profile-pictures')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });
      
      if (error) {
        logger.error('Error uploading profile picture:', error);
        throw ApiError.internal('Failed to upload profile picture');
      }
      
      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);
      
      // Update user profile with picture URL
      await userModel.update(id, { profilePictureUrl: urlData.publicUrl });
      
      res.status(200).json({
        error: false,
        message: 'Profile picture uploaded successfully',
        data: { url: urlData.publicUrl }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error uploading profile picture:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to upload profile picture'
        });
      }
    }
  }
}

export const userController = new UserController(); 