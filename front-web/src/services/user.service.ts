import axios from 'axios';
import { API_URL } from '../config/constants';
import { handleApiError } from '../utils/error-handler';
import { UserResponse, UserRole } from '../types/auth';

// Helper to check online status
const checkOnlineStatus = () => {
  return navigator.onLine;
};

/**
 * User Service for managing user-related operations
 */
export const userService = {
  /**
   * Get all users with optional filtering
   */
  getUsers: async (filters: { 
    role?: UserRole | string; 
    search?: string;
    limit?: number;
    page?: number;
    sort?: string;
  } = {}): Promise<UserResponse[]> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning empty array');
        return [];
      }

      console.log('Fetching users from API with filters:', filters);
      
      const params = new URLSearchParams();
      
      if (filters.role) {
        params.append('role', filters.role);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      
      if (filters.page) {
        params.append('page', filters.page.toString());
      }
      
      if (filters.sort) {
        params.append('sort', filters.sort);
      }
      
      const response = await axios.get(`${API_URL}/users?${params.toString()}`);
      return response.data.data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return empty array as fallback
      const errorMessage = handleApiError(error, 'Failed to fetch users').message;
      console.error(errorMessage);
      return [];
    }
  },

  /**
   * Get a user by ID
   */
  getUserById: async (id: string): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning null');
        return null;
      }

      console.log(`Fetching user with ID: ${id}`);
      const response = await axios.get(`${API_URL}/users/${id}`);
      return response.data.data.user;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      // Return null as fallback
      const errorMessage = handleApiError(error, `Failed to fetch user with ID ${id}`).message;
      console.error(errorMessage);
      return null;
    }
  },

  /**
   * Create a new user
   */
  createUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, cannot create user');
        throw new Error('Cannot create user while offline');
      }

      console.log('Creating new user:', userData);
      const response = await axios.post(`${API_URL}/users`, userData);
      return response.data.data.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw handleApiError(error, 'Failed to create user');
    }
  },

  /**
   * Update an existing user
   */
  updateUser: async (
    id: string,
    userData: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: UserRole;
    }>
  ): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, cannot update user');
        throw new Error('Cannot update user while offline');
      }

      console.log(`Updating user with ID ${id}:`, userData);
      const response = await axios.put(`${API_URL}/users/${id}`, userData);
      return response.data.data.user;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw handleApiError(error, `Failed to update user with ID ${id}`);
    }
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<boolean> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, cannot delete user');
        throw new Error('Cannot delete user while offline');
      }

      console.log(`Deleting user with ID: ${id}`);
      await axios.delete(`${API_URL}/users/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw handleApiError(error, `Failed to delete user with ID ${id}`);
    }
  }
}; 