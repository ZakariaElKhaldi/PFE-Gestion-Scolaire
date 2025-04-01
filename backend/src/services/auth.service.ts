import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { userModel } from '../models/user.model';
import { JwtPayload, SignInData, SignUpData, User, UserResponse } from '../types/auth';
import { sendEmail, loadEmailTemplate } from '../utils/email';
import { logger } from '../utils/logger';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: SignUpData): Promise<{ user: UserResponse; token: string }> {
    // Check if user already exists
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const userId = await userModel.create(userData);
    
    // Get the created user
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as UserResponse, token };
  }

  /**
   * Authenticate a user
   */
  async login(credentials: SignInData): Promise<{ user: UserResponse; token: string }> {
    // Find user by email
    const user = await userModel.findByEmail(credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await userModel.verifyPassword(
      credentials.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as UserResponse, token };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    // Define the payload
    const payload: JwtPayload = {
      userId: user.id,
      id: user.id, // Include id for backward compatibility
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Generate the token with expiration
    return jwt.sign(
      payload, 
      config.jwt.secret as Secret, 
      { expiresIn: '24h' } // Use a literal string instead of config
    );
  }

  /**
   * Verify token and return payload
   */
  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist (security best practice)
      return false;
    }

    try {
      // Generate a reset token using JWT with a short expiration time
      const resetToken = jwt.sign(
        { userId: user.id }, 
        config.jwt.secret as Secret, 
        { expiresIn: '1h' } // Token expires in 1 hour (matching the template text)
      );
      
      // In a real application, you would store the token in a database with an expiration time
      
      // Construct the reset URL that will be included in the email
      const resetUrl = `${config.frontendUrl}/auth/reset-password?token=${resetToken}`;
      
      console.log('Password reset requested for user:', user.email);
      console.log('Reset URL (for development):', resetUrl);
      
      // Load the password reset email template
      const emailHtml = loadEmailTemplate('password-reset', {
        name: `${user.firstName} ${user.lastName}`,
        resetLink: resetUrl,
        currentYear: new Date().getFullYear().toString()
      });
      
      // Send the password reset email
      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - School Management System',
        html: emailHtml
      });
      
      logger.info(`Password reset email sent to: ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      return false;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Verify the reset token
      const decoded = jwt.verify(token, config.jwt.secret as Secret) as JwtPayload;
      
      if (!decoded.userId) {
        logger.error('Invalid token payload - missing userId');
        throw new Error('Invalid token payload');
      }
      
      // Find the user
      const user = await userModel.findById(decoded.userId);
      if (!user) {
        logger.error(`User not found for ID: ${decoded.userId}`);
        throw new Error('User not found');
      }
      
      logger.info(`Processing password reset for user: ${user.email}`);
      
      // Update the user's password
      const success = await userModel.updatePassword(decoded.userId, newPassword);
      
      if (!success) {
        logger.error(`Failed to update password for user ID: ${decoded.userId}`);
        throw new Error('Failed to update password');
      }
      
      logger.info(`Password reset successful for user: ${user.email}`);
      
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error instanceof jwt.TokenExpiredError) {
          logger.error('Password reset token has expired');
          throw new Error('Password reset link has expired. Please request a new one.');
        }
        logger.error('Invalid password reset token', { error: error.message });
        throw new Error('Invalid password reset link. Please request a new one.');
      }
      
      logger.error('Password reset error:', { error });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponse | null> {
    const user = await userModel.findById(userId);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponse;
  }
}

export const authService = new AuthService(); 