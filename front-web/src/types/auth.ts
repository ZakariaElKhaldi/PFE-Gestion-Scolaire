import { z } from 'zod';
import { signInSchema, signUpSchema } from '@/validations/auth';

export type UserRole = 'administrator' | 'teacher' | 'student' | 'parent';

export interface UserSettings {
  language?: string;
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  displayMode?: 'light' | 'dark' | 'system';
  timezone?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  departmentId?: string;
  isVerified?: boolean;
  status?: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  settings?: UserSettings;
}

// Alias User to UserResponse for backward compatibility
export type User = UserResponse;

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignUpData = Omit<SignUpFormData, 'confirmPassword' | 'acceptTerms'>;
export type SignInData = SignInFormData;
