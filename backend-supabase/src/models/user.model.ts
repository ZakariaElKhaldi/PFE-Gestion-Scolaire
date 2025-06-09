import { supabaseAdmin } from '../config/supabase';
import { User, UserResponse, UserRole } from '../types/auth';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

class UserModel {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        logger.error('Error finding user by email:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Map snake_case DB fields to camelCase properties
      return {
        id: data.id,
        email: data.email,
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        profilePictureUrl: data.profile_picture_url,
        phoneNumber: data.phone_number,
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        isActive: data.is_active,
        isVerified: data.is_verified,
        resetPasswordToken: data.reset_password_token,
        resetPasswordExpires: data.reset_password_expires ? new Date(data.reset_password_expires) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in findByEmail:', error);
      return null;
    }
  }

  /**
   * Find user by id
   */
  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error('Error finding user by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      // Map snake_case DB fields to camelCase properties
      return {
        id: data.id,
        email: data.email,
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
        profilePictureUrl: data.profile_picture_url,
        phoneNumber: data.phone_number,
        lastLogin: data.last_login ? new Date(data.last_login) : undefined,
        isActive: data.is_active,
        isVerified: data.is_verified,
        resetPasswordToken: data.reset_password_token,
        resetPasswordExpires: data.reset_password_expires ? new Date(data.reset_password_expires) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
  }): Promise<string> {
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Generate UUID
      const id = uuidv4();
      
      // Create user in Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          id,
          email: userData.email,
          password: hashedPassword,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          phone_number: userData.phoneNumber || null,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) {
        logger.error('Error creating user:', error);
        
        if (error.code === '23505') { // Unique violation
          throw ApiError.conflict('An account with this email already exists');
        }
        
        throw ApiError.internal('Failed to create user account');
      }
      
      return data.id;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      logger.error('Error in create:', error);
      throw ApiError.internal('Failed to create user account');
    }
  }

  /**
   * Get all users with optional role filter
   */
  async findAll(role?: UserRole): Promise<UserResponse[]> {
    try {
      let query = supabaseAdmin
        .from('users')
        .select('id, email, first_name, last_name, role, profile_picture_url, phone_number, is_verified, created_at, updated_at');
      
      if (role) {
        query = query.eq('role', role);
      }
      
      const { data, error } = await query;
      
      if (error) {
        logger.error('Error finding all users:', error);
        return [];
      }
      
      // Map to UserResponse format
      return data.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role as UserRole,
        profilePictureUrl: user.profile_picture_url,
        phoneNumber: user.phone_number,
        isVerified: user.is_verified,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findAll:', error);
      return [];
    }
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<Omit<User, 'id' | 'password' | 'email' | 'role' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    try {
      // Convert camelCase to snake_case for database
      const dbData: Record<string, any> = {};
      
      if (userData.firstName !== undefined) dbData.first_name = userData.firstName;
      if (userData.lastName !== undefined) dbData.last_name = userData.lastName;
      if (userData.profilePictureUrl !== undefined) dbData.profile_picture_url = userData.profilePictureUrl;
      if (userData.phoneNumber !== undefined) dbData.phone_number = userData.phoneNumber;
      if (userData.isActive !== undefined) dbData.is_active = userData.isActive;
      if (userData.isVerified !== undefined) dbData.is_verified = userData.isVerified;
      
      // Add updated_at timestamp
      dbData.updated_at = new Date().toISOString();
      
      const { error } = await supabaseAdmin
        .from('users')
        .update(dbData)
        .eq('id', id);
      
      if (error) {
        logger.error('Error updating user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in update:', error);
      return false;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        logger.error('Error updating password:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in updatePassword:', error);
      return false;
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting user:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      return false;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const userModel = new UserModel(); 