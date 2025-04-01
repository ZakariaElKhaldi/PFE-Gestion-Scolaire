import { UserResponse } from '../types/auth';

/**
 * Parse JWT token to get its payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @returns True if token is expired or invalid
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;
    
    // Get current time in seconds (JWT exp is in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't parse the token, consider it expired
  }
};

/**
 * Validate user data to ensure it has all required fields
 * @param user User object to validate
 * @returns True if user object is valid
 */
export const isValidUser = (user: UserResponse | null): boolean => {
  return !!(
    user &&
    user.id &&
    user.email &&
    user.role &&
    (user.role === 'administrator' || 
     user.role === 'teacher' || 
     user.role === 'student' || 
     user.role === 'parent')
  );
};

/**
 * Get dashboard URL for a user based on their role
 * @param role User role
 * @returns Dashboard URL for the role
 */
export const getDashboardUrl = (role: string): string => {
  switch (role) {
    case 'administrator':
      return '/dashboard/admin';
    case 'teacher':
      return '/dashboard/teacher';
    case 'student':
      return '/dashboard/student';
    case 'parent':
      return '/dashboard/parent';
    default:
      return '/auth/sign-in';
  }
};

/**
 * Get display name for role
 * @param role User role
 * @returns Formatted display name for the role
 */
export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'administrator':
      return 'Administrator';
    case 'teacher':
      return 'Teacher';
    case 'student':
      return 'Student';
    case 'parent':
      return 'Parent';
    default:
      return 'User';
  }
};

/**
 * Ensures the student user has studentId property
 * For student users, if studentId is missing, uses userId as the studentId
 */
export const checkStudentId = (user: any): any => {
  if (!user) return null;
  
  // If it's a student role but doesn't have studentId, use the userId
  if (user.role === 'student' && !user.studentId && user.id) {
    console.log('Adding missing studentId to student user, using userId');
    return {
      ...user,
      studentId: user.id
    };
  }
  
  return user;
}; 