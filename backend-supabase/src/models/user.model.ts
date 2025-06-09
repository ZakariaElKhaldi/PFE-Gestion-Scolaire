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
      
      return data as User;
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
      
      return data as User;
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
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const userModel = new UserModel(); 