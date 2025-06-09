import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { SignInData, SignUpData } from '../types/auth';
import { supabaseAdmin } from '../config/supabase';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: SignUpData = req.body;
      
      const { user, token } = await authService.register(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        error: false,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Registration error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to register user'
        });
      }
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        throw ApiError.badRequest('Verification token is required');
      }
      
      const success = await authService.verifyEmail(token);
      
      if (success) {
        res.status(200).json({
          error: false,
          message: 'Email verified successfully'
        });
      } else {
        throw ApiError.badRequest('Failed to verify email');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Email verification error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to verify email'
        });
      }
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials: SignInData = req.body;
      
      const { user, token } = await authService.login(credentials);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        error: false,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Login error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to login'
        });
      }
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }
      
      const user = await authService.getCurrentUser(req.user.userId);
      
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json({
        error: false,
        data: {
          user: userWithoutPassword
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Get current user error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to get user information'
        });
      }
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw ApiError.badRequest('Email is required');
      }
      
      await authService.requestPasswordReset(email);
      
      // Always return success to prevent email enumeration
      res.status(200).json({
        error: false,
        message: 'If the email exists, a password reset link has been sent'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Forgot password error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to process password reset request'
        });
      }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        throw ApiError.badRequest('Token and new password are required');
      }
      
      await authService.resetPassword(token, newPassword);
      
      res.status(200).json({
        error: false,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Reset password error:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to reset password'
        });
      }
    }
  }

  /**
   * Verify parent connection
   */
  async verifyParentConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId, studentId } = req.params;
      
      if (!invitationId && !studentId) {
        throw ApiError.badRequest('Invalid verification data');
      }
      
      // Handle verification based on which ID is provided
      if (invitationId) {
        const { data, error } = await supabaseAdmin
          .from('parent_invitations')
          .update({ 
            status: 'verified',
            verified_at: new Date().toISOString() 
          })
          .eq('id', invitationId)
          .select('*')
          .single();
          
        if (error || !data) {
          throw ApiError.badRequest('Invalid or expired invitation');
        }
        
        return res.status(200).json({
          success: true,
          message: 'Parent invitation verified successfully',
          data: {
            invitationId,
            studentId: data.student_id,
            status: 'verified'
          }
        });
      }
      
      if (studentId) {
        const { data, error } = await supabaseAdmin
          .from('parent_student_relationships')
          .update({ 
            status: 'verified',
            verified_at: new Date().toISOString() 
          })
          .eq('student_id', studentId)
          .select('*');
          
        if (error || !data || data.length === 0) {
          throw ApiError.badRequest('Invalid parent-student connection');
        }
        
        return res.status(200).json({
          success: true,
          message: 'Parent-student connection verified successfully',
          data: {
            studentId,
            status: 'verified'
          }
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController(); 