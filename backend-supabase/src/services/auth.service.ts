import { supabaseAdmin } from '../config/supabase';
import { userModel } from '../models/user.model';
import { SignInData, SignUpData, UserRole, User } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/token-utils';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: SignUpData): Promise<{ user: User; token: string }> {
    try {
      // Check if email already exists
      const existingUser = await userModel.findByEmail(userData.email);
      if (existingUser) {
        throw ApiError.conflict('An account with this email already exists');
      }

      // Create user
      const userId = await userModel.create({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phoneNumber: userData.phoneNumber
      });

      // Get the created user
      const user = await userModel.findById(userId);
      if (!user) {
        throw ApiError.internal('Failed to retrieve user after creation');
      }

      // Generate token
      const token = generateToken(userId, userData.role);

      return { user, token };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Registration error:', error);
      throw ApiError.internal('Failed to register user');
    }
  }

  /**
   * Login user
   */
  async login(credentials: SignInData): Promise<{ user: User; token: string }> {
    try {
      // Find user by email
      const user = await userModel.findByEmail(credentials.email);
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await userModel.verifyPassword(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw ApiError.unauthorized('Your account has been deactivated');
      }

      // Generate token
      const token = generateToken(user.id, user.role);

      // Update last login time
      await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      return { user, token };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Login error:', error);
      throw ApiError.internal('Failed to login');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string): Promise<User | null> {
    try {
      return await userModel.findById(userId);
    } catch (error) {
      logger.error('Get current user error:', error);
      throw ApiError.internal('Failed to get user information');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Find user by email
      const user = await userModel.findByEmail(email);
      if (!user) {
        // Don't reveal that the email doesn't exist
        return true;
      }

      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token expires in 1 hour

      // Update user with reset token
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          reset_password_token: resetToken,
          reset_password_expires: resetExpires.toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Error updating reset token:', error);
        throw ApiError.internal('Failed to process password reset request');
      }

      // TODO: Send password reset email

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Password reset request error:', error);
      throw ApiError.internal('Failed to process password reset request');
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Find user by reset token
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('reset_password_token', token)
        .single();

      if (error || !data) {
        throw ApiError.badRequest('Invalid or expired reset token');
      }

      const user = data as User;

      // Check if token is expired
      const tokenExpiry = new Date(user.resetPasswordExpires || '');
      if (tokenExpiry < new Date()) {
        throw ApiError.badRequest('Reset token has expired');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          password: hashedPassword,
          reset_password_token: null,
          reset_password_expires: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        logger.error('Error updating password:', updateError);
        throw ApiError.internal('Failed to reset password');
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Password reset error:', error);
      throw ApiError.internal('Failed to reset password');
    }
  }
}

export const authService = new AuthService(); 