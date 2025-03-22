import { Request } from 'express';

export type UserRole = 'administrator' | 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
  password: string; // Only used for database, never returned to client
  bio?: string;
  emailVerified?: boolean; // Whether the user's email has been verified
  accountLocked?: boolean; // Whether the account is locked due to suspicious activity
  accountSuspended?: boolean; // Whether the account has been suspended by an admin
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
  studentId?: string;
  createdAt: string;
  updatedAt: string;
  bio?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  token: string;
  newPassword: string;
}

export interface JwtPayload {
  userId: string;
  id?: string; // For backward compatibility with code that uses id instead of userId
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
} 