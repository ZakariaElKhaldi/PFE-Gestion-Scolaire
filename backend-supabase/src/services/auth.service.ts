import { supabaseAdmin } from '../config/supabase';
import { userModel } from '../models/user.model';
import { SignInData, SignUpData, UserRole, User } from '../types/auth';
import { ApiError } from '../utils/ApiError';
import { generateToken } from '../utils/token-utils';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

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

      // Create a user in Supabase Auth with email confirmation
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: false, // This will trigger an email verification
        user_metadata: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phoneNumber: userData.phoneNumber || null
        }
      });

      if (authError) {
        logger.error('Error creating user in Supabase Auth:', authError);
        throw ApiError.internal(authError.message || 'Failed to create user account');
      }

      if (!authData.user) {
        throw ApiError.internal('Failed to create user account in Supabase Auth');
      }

      // Create user in our custom users table
      const userId = await userModel.create({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        supabaseUserId: authData.user.id
      });

      // Get the created user
      const user = await userModel.findById(userId);
      if (!user) {
        throw ApiError.internal('Failed to retrieve user after creation');
      }

      // Generate token
      const token = generateToken(userId, userData.role);
      
      // Handle parent email if provided (for student registration)
      if (userData.role === UserRole.STUDENT && userData.parentEmail) {
        try {
          await this.registerParentConnection(userId, userData.parentEmail, `${userData.firstName} ${userData.lastName}`);
        } catch (parentError) {
          // Log but don't fail the registration
          logger.error('Error registering parent connection:', parentError);
        }
      }

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
   * Register parent connection for student
   */
  private async registerParentConnection(studentId: string, parentEmail: string, studentName: string): Promise<void> {
    try {
      // Check if parent already exists
      const existingParent = await userModel.findByEmail(parentEmail);
      
      if (existingParent) {
        // Parent already exists, create connection
        await supabaseAdmin
          .from('parent_student_relationships')
          .insert({
            parent_id: existingParent.id,
            student_id: studentId,
            status: 'pending',
            created_at: new Date().toISOString(),
            relationship_type: 'parent'
          });

        // Send parent invitation through Supabase Auth
        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(parentEmail, {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/parent-verification?studentId=${studentId}`,
          data: {
            studentId,
            studentName,
            type: 'parent_connection'
          }
        });

        if (error) {
          logger.error('Error sending parent invitation email:', error);
          throw new Error(`Failed to send parent invitation: ${error.message}`);
        }
      } else {
        // Parent doesn't exist, create invitation record
        const invitationId = uuidv4();
        
        await supabaseAdmin
          .from('parent_invitations')
          .insert({
            id: invitationId,
            email: parentEmail,
            student_id: studentId,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            created_at: new Date().toISOString()
          });
          
        // Send invitation email through Supabase Auth
        const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(parentEmail, {
          redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/parent-verification?invitationId=${invitationId}`,
          data: {
            studentId,
            studentName,
            type: 'parent_invitation',
            invitationId
          }
        });

        if (error) {
          logger.error('Error sending parent invitation email:', error);
          throw new Error(`Failed to send parent invitation: ${error.message}`);
        }
      }
      
      logger.info(`Parent connection registered for student ${studentId} with parent email ${parentEmail}`);
    } catch (error) {
      logger.error('Error registering parent connection:', error);
      throw error; // Rethrow to be handled by caller
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Use Supabase Auth to verify the email
      const { data, error } = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      
      if (error) {
        logger.error('Error verifying email with Supabase Auth:', error);
        throw ApiError.badRequest('Invalid or expired verification token');
      }
      
      if (!data || !data.user) {
        throw ApiError.badRequest('Invalid verification token');
      }
      
      // Update our custom user record
      const user = await userModel.findBySupabaseUserId(data.user.id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }
      
      const updateSuccess = await userModel.update(user.id, {
        isVerified: true
      });
      
      if (!updateSuccess) {
        throw ApiError.internal('Failed to update user verification status');
      }
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Email verification error:', error);
      throw ApiError.internal('Failed to verify email');
    }
  }

  /**
   * Login user
   */
  async login(credentials: SignInData): Promise<{ user: User; token: string }> {
    try {
      // First try to authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (authError) {
        logger.error('Supabase Auth login error:', authError);
        throw ApiError.unauthorized('Invalid email or password');
      }
      
      if (!authData.user) {
        throw ApiError.unauthorized('Invalid email or password');
      }
      
      // Find user in our custom table
      const user = await userModel.findByEmail(credentials.email);
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw ApiError.unauthorized('Your account has been deactivated');
      }
      
      // Check if user is verified
      if (!user.isVerified && authData.user.email_confirmed_at === null) {
        throw ApiError.forbidden('Please verify your email address before logging in');
      }
      
      // If Supabase Auth says they're verified but our DB doesn't, update our DB
      if (authData.user.email_confirmed_at !== null && !user.isVerified) {
        await userModel.update(user.id, { isVerified: true });
        user.isVerified = true;
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
      // Use Supabase Auth's password reset functionality
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password`
      });
      
      if (error) {
        logger.error('Error requesting password reset through Supabase Auth:', error);
        // Don't reveal that the email doesn't exist
        return true;
      }

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
      // Use Supabase Auth to update the password
      const { error } = await supabaseAdmin.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        logger.error('Error resetting password through Supabase Auth:', error);
        throw ApiError.badRequest('Invalid or expired reset token');
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