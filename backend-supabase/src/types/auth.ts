/**
 * User roles in the system
 */
export enum UserRole {
  ADMINISTRATOR = 'administrator',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent'
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
  phoneNumber?: string;
  lastLogin?: Date;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  verificationToken?: string;
}

/**
 * User response (without sensitive information)
 */
export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePictureUrl?: string;
  phoneNumber?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT payload
 */
export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Sign in data
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up data
 */
export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  parentEmail?: string;
  parentFirstName?: string;
  parentLastName?: string;
  studentEmail?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset data
 */
export interface PasswordResetData {
  token: string;
  newPassword: string;
} 