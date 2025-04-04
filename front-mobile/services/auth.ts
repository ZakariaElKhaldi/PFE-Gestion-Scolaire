import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../utils/api-client';
import { SignInData, SignUpData, User, ResetPasswordData, UpdatePasswordData } from '../types/auth';
import { AUTH_STORAGE_KEY, FEATURES } from '../utils/config';

// Mock data for when backend is disabled
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
  },
  {
    id: '2',
    email: 'teacher@example.com',
    password: 'password',
    firstName: 'Teacher',
    lastName: 'Smith',
    role: 'teacher',
  },
  {
    id: '3',
    email: 'student@example.com',
    password: 'password',
    firstName: 'Student',
    lastName: 'Johnson',
    role: 'student',
    studentId: 'ST12345',
  },
  {
    id: '4',
    email: 'parent@example.com',
    password: 'password',
    firstName: 'Parent',
    lastName: 'Brown',
    role: 'parent',
  },
];

class AuthService {
  private readonly basePath = '/auth';

  async signIn(data: SignInData): Promise<{ user: User; token: string }> {
    try {
      const { data: response } = await apiClient.post<{ user: User; token: string }>(
        `${this.basePath}/login`,
        data
      );
      
      // Store the token
      await apiClient.setAuthToken(response.token);
      
      return response;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        // Mock authentication for development
        const user = MOCK_USERS.find(
          (u) => u.email === data.email && u.password === data.password
        );
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        const { password, ...userWithoutPassword } = user;
        const token = `mock_token_${Date.now()}`;
        
        // Store the token
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
        
        return {
          user: userWithoutPassword as User,
          token,
        };
      }
      throw error;
    }
  }

  async signUp(data: SignUpData): Promise<{ user: User; token: string }> {
    try {
      const { data: response } = await apiClient.post<{ user: User; token: string }>(
        `${this.basePath}/register`,
        data
      );
      
      // Store the token
      await apiClient.setAuthToken(response.token);
      
      return response;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        // Mock registration for development
        const existingUser = MOCK_USERS.find((u) => u.email === data.email);
        
        if (existingUser) {
          throw new Error('Email already in use');
        }
        
        const newUser = {
          id: `${MOCK_USERS.length + 1}`,
          ...data,
        };
        
        const { password, ...userWithoutPassword } = newUser;
        const token = `mock_token_${Date.now()}`;
        
        // Store the token
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
        
        return {
          user: userWithoutPassword as User,
          token,
        };
      }
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/logout`, {});
      await apiClient.removeAuthToken();
    } catch (error) {
      // Even if the API call fails, we still want to remove the token
      await apiClient.removeAuthToken();
      
      if (!FEATURES.enableBackend) {
        return;
      }
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const { data: response } = await apiClient.post<{ message: string }>(
        `${this.basePath}/reset-password`,
        data
      );
      return response;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        return { message: 'Password reset email sent successfully' };
      }
      throw error;
    }
  }

  async updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    try {
      const { data: response } = await apiClient.post<{ message: string }>(
        `${this.basePath}/update-password`,
        data
      );
      return response;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        return { message: 'Password updated successfully' };
      }
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data } = await apiClient.get<User>(`${this.basePath}/me`);
      return data;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        const token = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        
        if (!token) {
          return null;
        }
        
        // Return a mock user for development
        return {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'administrator',
        };
      }
      return null;
    }
  }

  async updateProfile(userId: string, profileData: FormData): Promise<User> {
    try {
      const { data } = await apiClient.put<User>(
        `${this.basePath}/profile/${userId}`,
        profileData
      );
      return data;
    } catch (error) {
      if (!FEATURES.enableBackend) {
        // Return a mock updated user for development
        return {
          id: userId,
          email: 'admin@example.com',
          firstName: 'Updated',
          lastName: 'User',
          role: 'administrator',
        };
      }
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    return !!token;
  }
  
  async setSessionToken(token: string): Promise<void> {
    // Set the token in the API client without storing it in AsyncStorage
    await apiClient.setAuthToken(token);
  }
}

export const authService = new AuthService(); 