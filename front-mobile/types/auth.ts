export type UserRole = 'administrator' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profilePicture?: string; // Image URLs as strings (common in React Native)
  phoneNumber?: string;
  studentId?: string;
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
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: string | File | any;  // For image upload, React Native often uses a library like `react-native-image-picker`, and the file type might need a different approach
}
