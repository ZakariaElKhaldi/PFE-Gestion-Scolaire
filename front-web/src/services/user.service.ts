import axios from 'axios';
import { API_URL } from '../config/constants';
import { handleApiError } from '../utils/error-handler';
import { UserResponse, UserRole } from '../types/auth';

// Helper to check online status
const checkOnlineStatus = () => {
  return navigator.onLine;
};

// Mock users data for offline mode
const MOCK_USERS: UserResponse[] = [
  {
    id: '1',
    email: 'admin@school.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator',
    phoneNumber: '+1 (555) 123-4567',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    profilePicture: '',
    bio: 'School administrator with 10+ years of experience'
  },
  {
    id: '2',
    email: 'teacher1@school.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'teacher',
    phoneNumber: '+1 (555) 234-5678',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    teacherId: 'T1001',
    profilePicture: '',
    bio: 'Mathematics teacher specializing in calculus'
  },
  {
    id: '3',
    email: 'teacher2@school.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'teacher',
    phoneNumber: '+1 (555) 345-6789',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    teacherId: 'T1002',
    profilePicture: '',
    bio: 'Science teacher with focus on biology and chemistry'
  },
  {
    id: '4',
    email: 'student1@school.com',
    firstName: 'Michael',
    lastName: 'Brown',
    role: 'student',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    studentId: 'S2001',
    profilePicture: '',
  },
  {
    id: '5',
    email: 'student2@school.com',
    firstName: 'Emily',
    lastName: 'Davis',
    role: 'student',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    studentId: 'S2002',
    profilePicture: '',
  },
  {
    id: '6',
    email: 'parent1@example.com',
    firstName: 'Robert',
    lastName: 'Wilson',
    role: 'parent',
    phoneNumber: '+1 (555) 456-7890',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parentId: 'P3001',
    profilePicture: '',
  },
  {
    id: '7',
    email: 'parent2@example.com',
    firstName: 'Jennifer',
    lastName: 'Taylor',
    role: 'parent',
    phoneNumber: '+1 (555) 567-8901',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    parentId: 'P3002',
    profilePicture: '',
  }
];

// Filter mock users based on search and role
const filterMockUsers = (users: UserResponse[], filters: { role?: string; search?: string }) => {
  let filteredUsers = [...users];
  
  // Filter by role
  if (filters.role) {
    const roles = filters.role.split(',');
    filteredUsers = filteredUsers.filter(user => roles.includes(user.role));
  }
  
  // Filter by search term
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
  
  return filteredUsers;
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
        console.log('Browser is offline, returning mock users');
        return filterMockUsers(MOCK_USERS, filters);
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
      
      try {
        const response = await axios.get(`${API_URL}/users?${params.toString()}`);
        if (response.data && response.data.data && response.data.data.users) {
          return response.data.data.users;
        } else {
          console.warn('Invalid API response format, using mock data');
          return filterMockUsers(MOCK_USERS, filters);
        }
      } catch (apiError) {
        console.error('API error, falling back to mock data:', apiError);
        return filterMockUsers(MOCK_USERS, filters);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return mock data as fallback
      const errorMessage = handleApiError(error, 'Failed to fetch users').message;
      console.error(errorMessage);
      return filterMockUsers(MOCK_USERS, filters);
    }
  },

  /**
   * Get a user by ID
   */
  getUserById: async (id: string): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning mock user');
        const mockUser = MOCK_USERS.find(user => user.id === id);
        return mockUser || null;
      }

      console.log(`Fetching user with ID: ${id}`);
      try {
        const response = await axios.get(`${API_URL}/users/${id}`);
        if (response.data && response.data.data && response.data.data.user) {
          return response.data.data.user;
        } else {
          console.warn('Invalid API response format, using mock data');
          const mockUser = MOCK_USERS.find(user => user.id === id);
          return mockUser || null;
        }
      } catch (apiError) {
        console.error('API error, falling back to mock data:', apiError);
        const mockUser = MOCK_USERS.find(user => user.id === id);
        return mockUser || null;
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      // Return mock user as fallback
      const errorMessage = handleApiError(error, `Failed to fetch user with ID ${id}`).message;
      console.error(errorMessage);
      const mockUser = MOCK_USERS.find(user => user.id === id);
      return mockUser || null;
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
    phoneNumber?: string;
  }): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, simulating user creation with mock data');
        // Create a mock user with the provided data
        const newUser: UserResponse = {
          id: `mock-${Date.now()}`,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profilePicture: '',
        };
        
        // Add role-specific IDs
        if (userData.role === 'student') {
          newUser.studentId = `S${Math.floor(1000 + Math.random() * 9000)}`;
        } else if (userData.role === 'teacher') {
          newUser.teacherId = `T${Math.floor(1000 + Math.random() * 9000)}`;
        } else if (userData.role === 'parent') {
          newUser.parentId = `P${Math.floor(1000 + Math.random() * 9000)}`;
        }
        
        // Add to mock users (in a real app, this would persist to localStorage)
        MOCK_USERS.push(newUser);
        
        return newUser;
      }

      console.log('Creating new user:', userData);
      const response = await axios.post(`${API_URL}/users`, userData);
      if (response.data && response.data.data && response.data.data.user) {
        return response.data.data.user;
      } else {
        throw new Error('Invalid API response format');
      }
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
      phoneNumber?: string;
    }>
  ): Promise<UserResponse | null> => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, simulating user update with mock data');
        // Find the user in mock data
        const userIndex = MOCK_USERS.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
          throw new Error(`User with ID ${id} not found`);
        }
        
        // Update the user
        const updatedUser = {
          ...MOCK_USERS[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };
        
        // Update the mock users array
        MOCK_USERS[userIndex] = updatedUser;
        
        return updatedUser;
      }

      console.log(`Updating user with ID ${id}:`, userData);
      const response = await axios.put(`${API_URL}/users/${id}`, userData);
      if (response.data && response.data.data && response.data.data.user) {
        return response.data.data.user;
      } else {
        throw new Error('Invalid API response format');
      }
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
        console.log('Browser is offline, simulating user deletion with mock data');
        // Find the user index
        const userIndex = MOCK_USERS.findIndex(user => user.id === id);
        
        if (userIndex === -1) {
          throw new Error(`User with ID ${id} not found`);
        }
        
        // Remove the user from mock data
        MOCK_USERS.splice(userIndex, 1);
        
        return true;
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