import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { 
  AuthContextType, 
  SignInData, 
  SignUpData, 
  User, 
  ResetPasswordData, 
  UpdatePasswordData, 
  UpdateProfileData 
} from '../../types/auth';
import { authService } from '../../services/auth';
import { AUTH_STORAGE_KEY } from '../../utils/config';

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  updateProfile: async () => {},
  clearError: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if the user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        
        if (storedToken) {
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setToken(storedToken);
          } else {
            // Token is invalid or expired
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (data: SignInData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.signIn(data);
      
      // Store token based on remember me option
      if (data.rememberMe) {
        // If rememberMe is true, store token in AsyncStorage for persistence
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, response.token);
      } else {
        // For session-only authentication, store in memory but not in AsyncStorage
        // This way the token is available during the session but clears on app close
        setToken(response.token);
        // Ensure API client has the token for requests
        await authService.setSessionToken(response.token);
      }
      
      setUser(response.user);
      setToken(response.token);
      
      // Navigate to the appropriate dashboard based on user role
      if (response.user.role === 'administrator') {
        router.replace('/(app)/admin');
      } else if (response.user.role === 'teacher') {
        router.replace('/(app)/teacher');
      } else if (response.user.role === 'student') {
        router.replace('/(app)/student');
      } else if (response.user.role === 'parent') {
        router.replace('/(app)/parent');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.signUp(data);
      
      setUser(response.user);
      setToken(response.token);
      
      // Navigate to the role selection screen
      router.replace('/role-select');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await authService.signOut();
      
      setUser(null);
      setToken(null);
      
      // Navigate to the login screen
      router.replace('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.resetPassword(data);
      
      // Navigate to the login screen with a success message
      router.replace({
        pathname: '/login',
        params: { message: 'Password reset email sent. Please check your inbox.' }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (data: UpdatePasswordData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.updatePassword(data);
      
      // Navigate to the login screen with a success message
      router.replace({
        pathname: '/login',
        params: { message: 'Password updated successfully. Please sign in with your new password.' }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during password update');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const formData = new FormData();
      
      // Add profile data to form data
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      
      if (data.phoneNumber) {
        formData.append('phoneNumber', data.phoneNumber);
      }
      
      if (data.profilePicture) {
        formData.append('profilePicture', data.profilePicture as any);
      }
      
      const updatedUser = await authService.updateProfile(user.id, formData as any);
      setUser(updatedUser);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred during profile update');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 