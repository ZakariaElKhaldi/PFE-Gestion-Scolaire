import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { SignInData, SignUpData } from '../types/auth';
import { userModel } from '../models/user.model';
import { parentRelationshipService } from '../services/parent-relationship.service';
import { generateToken } from '../utils/token-utils';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { ValidationResult } from '../types/generic';
import jwt from 'jsonwebtoken';
import { loginAttemptsService } from '../services/login-attempts.service';

// Constants for login security
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

// Define User interface to match what's expected by userModel.createWithConnection
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
  accountLocked?: boolean;
  accountSuspended?: boolean;
}

// Define RelationshipType enum for parent relationship service
enum RelationshipType {
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

class AuthController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Auth]
   *     summary: Register a new user
   *     description: Create a new user account
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - firstName
   *               - lastName
   *               - role
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password (min 6 characters)
   *               firstName:
   *                 type: string
   *                 description: User's first name
   *               lastName:
   *                 type: string
   *                 description: User's last name
   *               role:
   *                 type: string
   *                 enum: [admin, teacher, student, parent]
   *                 description: User's role in the system
   *               phoneNumber:
   *                 type: string
   *                 description: User's phone number (optional)
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Invalid input data
   *       409:
   *         description: Email already in use
   *       500:
   *         description: Server error
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      console.log('Registration request received:', {
        email: req.body.email,
        role: req.body.role,
        // Exclude sensitive data
      });
      
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        role, 
        phoneNumber, 
        studentEmail, 
        parentEmail,
        parentFirstName,
        parentLastName
      } = req.body;

      // Check if user already exists
      try {
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
          logger.warn('Registration failed: User already exists');
          throw ApiError.conflict('An account with this email already exists');
        }
      } catch (existingUserError) {
        logger.error('Error checking for existing user:', existingUserError);
        if (existingUserError instanceof ApiError) {
          throw existingUserError;
        }
        throw ApiError.internal('Failed to check if user exists');
      }

      // Hash password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (hashError) {
        logger.error('Error hashing password:', hashError);
        throw ApiError.internal('Failed to secure password');
      }

      let newUser;
      let token;

      // Start a transaction for database consistency
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();

        // Create the user
        try {
          logger.info('Attempting to create new user with details:', {
            email,
            firstName,
            lastName,
            role,
            phoneNumber,
            // Excluding password for security
          });
          
          newUser = await userModel.createWithConnection(connection, {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            phoneNumber,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          logger.info('User created successfully:', { id: newUser.id, email: newUser.email, role: newUser.role });
        } catch (createUserError: any) {
          logger.error('Detailed error creating user:', {
            error: createUserError,
            message: createUserError.message,
            code: createUserError.code,
            sqlMessage: createUserError.sqlMessage,
            sqlState: createUserError.sqlState,
            sql: createUserError.sql
          });
          throw ApiError.internal(`Failed to create user account: ${createUserError.message || 'Database error'}`);
        }
        
        // Generate JWT token
        try {
          token = generateToken(newUser.id);
        } catch (tokenError) {
          logger.error('Error generating token:', tokenError);
          throw ApiError.internal('Failed to generate authentication token');
        }

        // Handle special registration cases
        if (role === 'parent' && studentEmail) {
          try {
            // Create parent-student relationship with the correct relationship type
            await parentRelationshipService.createRelationshipRequest(
              newUser.id,
              studentEmail,
              RelationshipType.PARENT,
              ''
            );
            logger.info('Parent-student relationship request created');
          } catch (relationshipError: any) {
            logger.error('Error creating parent-student relationship:', relationshipError);
            // Don't throw here - still create the account even if relationship fails
            // but log it clearly
          }
        } else if (role === 'student' && parentEmail) {
          try {
            // Create student-parent relationship
            await parentRelationshipService.createStudentInitiatedRelationshipWithConnection(
              connection,
              newUser.id,
              parentEmail,
              parentFirstName,
              parentLastName
            );
            logger.info('Student-parent relationship created');
          } catch (relationshipError: any) {
            logger.error('Error creating student-parent relationship:', relationshipError);
            // Don't throw here - still create the account even if relationship fails
            // but log it clearly
          }
        }

        // Commit the transaction
        await connection.commit();
        logger.info('Transaction committed successfully');

        // Send success response
        res.status(201).json({
          error: false,
          message: 'User registered successfully',
          data: {
            user: {
              id: newUser.id,
              email: newUser.email,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              role: newUser.role,
              phoneNumber: newUser.phoneNumber
            },
            token
          }
        });
      } catch (txError: any) {
        // If anything fails, roll back the transaction
        await connection.rollback();
        logger.error('Transaction rolled back due to error:', txError);
        throw txError;
      } finally {
        connection.release();
      }
    } catch (error: any) {
      logger.error('Registration error:', error);
      const apiError = ApiError.from(error);
      
      res.status(apiError.status).json({
        error: true,
        message: apiError.message,
        details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Auth]
   *     summary: User login
   *     description: Authenticate a user and return a JWT token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: User's email address
   *               password:
   *                 type: string
   *                 format: password
   *                 description: User's password
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: JWT access token
   *                 user:
   *                   type: object
   *                   description: User information
   *       401:
   *         description: Invalid credentials
   *       500:
   *         description: Server error
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        logger.warn('Login failed: Missing email or password');
        return res.status(400).json({
          error: true,
          message: 'Email and password are required'
        });
      }
      
      logger.info(`Login attempt for email: ${email}`);
      
      // Track login attempts and implement rate limiting
      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      const attempts = await loginAttemptsService.recordAttempt(email, ipAddress);
      
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        logger.warn(`Login blocked: Too many failed attempts for ${email}`);
        return res.status(429).json({
          error: true,
          message: 'Too many failed login attempts. Please try again later.',
          retryAfter: LOCK_DURATION_MINUTES, // minutes
          code: 'TOO_MANY_ATTEMPTS'
        });
      }
      
      // Check if user exists
      const user = await userModel.findByEmail(email);
      
      if (!user) {
        logger.warn(`Login failed: User not found for email ${email}`);
        // Use generic message to prevent account enumeration
        return res.status(401).json({ 
          error: true, 
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        });
      }
      
      logger.info(`User found: ${user.id} with role ${user.role}, checking password...`);
      
      // Check if email is verified - if not explicitly set to false, assume it's verified (true)
      if (user.emailVerified === false) {
        logger.warn(`Login denied: Email not verified for user ${user.id}`);
        return res.status(403).json({
          error: true,
          message: 'Please verify your email before logging in',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }
      
      // Check if account is locked (only if explicitly set to true)
      if (user.accountLocked === true) {
        logger.warn(`Login denied: Account locked for user ${user.id}`);
        return res.status(403).json({
          error: true,
          message: 'Your account has been locked due to suspicious activity. Please contact support.',
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      // Check if account is suspended (only if explicitly set to true)
      if (user.accountSuspended === true) {
        logger.warn(`Login denied: Account suspended for user ${user.id}`);
        return res.status(403).json({
          error: true,
          message: 'Your account has been suspended. Please contact support.',
          code: 'ACCOUNT_SUSPENDED'
        });
      }
      
      // Validate password
      try {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
          logger.warn(`Login failed: Invalid password for user ${user.id}`);
          // Record failed login attempt
          await loginAttemptsService.recordAttempt(email, req.ip || 'unknown');
          
          // Use generic message to prevent account enumeration
          return res.status(401).json({ 
            error: true, 
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS'
          });
        }
      } catch (passwordError) {
        logger.error(`Password comparison error for user ${user.id}:`, passwordError);
        return res.status(500).json({
          error: true,
          message: 'Authentication error. Please try again later.',
          code: 'INTERNAL_SERVER_ERROR'
        });
      }
      
      // Reset login attempts counter on successful login
      await loginAttemptsService.resetAttempts(email);
      
      logger.info(`Password validated for user ${user.id}, generating token`);
      
      // Generate JWT token with appropriate claims
      const token = jwt.sign(
        { 
          id: user.id, 
          userId: user.id,
          email: user.email, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          ...(user.role === 'student' && { studentId: user.id })
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { 
          expiresIn: '24h',
          issuer: 'school-management-api',
          audience: 'school-management-client'
        }
      );
      
      // Record successful login for audit purposes
      logger.info(`Login successful for user ${user.id}, token generated`);
      
      // Return user data (without password) and token
      const userResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      return res.status(200).json({
        error: false,
        message: 'Login successful',
        data: {
          user: userResponse,
          token
        }
      });
    } catch (error) {
      logger.error('Login error: ', error);
      
      // Handle specific known errors
      if (error instanceof ApiError) {
        return res.status(error.status).json({
          error: true,
          message: error.message,
          code: error.code
        });
      }
      
      // Handle unexpected errors
      return res.status(500).json({
        error: true,
        message: 'An unexpected error occurred during login',
        code: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      await authService.requestPasswordReset(email);
      
      // Always return success to prevent email enumeration
      res.status(200).json({
        error: false,
        message: 'If the email exists, a password reset link will be sent',
      });
    } catch (error: any) {
      logger.error('Password reset request error:', error);
      const apiError = ApiError.from(error);
      
      res.status(apiError.status).json({
        error: true,
        message: apiError.message || 'Failed to process request',
      });
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      
      const success = await authService.resetPassword(token, newPassword);
      
      if (!success) {
        throw ApiError.badRequest('Failed to reset password');
      }
      
      res.status(200).json({
        error: false,
        message: 'Password reset successful',
      });
    } catch (error: any) {
      logger.error('Password reset error:', error);
      const apiError = ApiError.from(error);
      
      res.status(apiError.status).json({
        error: true,
        message: apiError.message,
      });
    }
  }

  /**
   * Get current authenticated user (me)
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user || !req.user.userId) {
        throw ApiError.unauthorized('Authentication required');
      }
      
      // The auth middleware already verified the token
      res.status(200).json({
        error: false,
        data: { user: req.user },
        message: 'User information retrieved',
      });
    } catch (error: any) {
      logger.error('Get current user error:', error);
      const apiError = ApiError.from(error);
      
      res.status(apiError.status).json({
        error: true,
        message: apiError.message,
      });
    }
  }
}

export const authController = new AuthController(); 