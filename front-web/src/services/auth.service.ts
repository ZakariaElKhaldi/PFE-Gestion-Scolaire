import axios from 'axios';
import { SignInData, SignUpData, UserResponse } from '@/types/auth';
import { saveAuthToken, removeAuthToken } from '@/lib/api-client';
import { checkStudentId } from '@/lib/auth-utils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class AuthService {
  private readonly basePath = '/auth';

  // Initialize auth headers for axios
  constructor() {
    // Set up interceptor to add auth token to all requests
    axios.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
          this.logout();
          // Redirect to login
          window.location.href = '/auth/sign-in';
        }
        return Promise.reject(error);
      }
    );
  }

  async register(userData: SignUpData): Promise<{ user: UserResponse; token: string }> {
    try {
      console.log('Starting registration process for:', userData.email, 'with role:', userData.role);
      
      // Special handling for student registration with parent email (most problematic case)
      if (userData.role === 'student' && userData.parentEmail) {
        console.log('Detected student registration with parent email:', userData.parentEmail);
        
        console.log('Sending student registration request to:', `${API_BASE_URL}${this.basePath}/register`);
        console.log('Request payload:', {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phoneNumber: userData.phoneNumber,
          role: userData.role,
          password: '[REDACTED]',
          parentEmail: userData.parentEmail,
          parentFirstName: userData.parentFirstName || '',
          parentLastName: userData.parentLastName || ''
        });
        
        try {
          const { data } = await axios.post(`${API_BASE_URL}${this.basePath}/register`, userData, {
            withCredentials: true
          });
          console.log('Student+parent registration complete response:', data);
          
          if (data.error) {
            console.error('Student+parent registration failed with error:', data.message);
            throw new Error(data.message || 'Registration failed');
          }
          
          console.log('Student+parent registration completed successfully');
          return data.data;
        } catch (err: any) {
          console.error('Student+parent registration error:', {
            status: err.response?.status,
            message: err.response?.data?.message || err.message,
            error: err
          });
          throw err;
        }
      } 
      // Handle other registration types normally
      else {
        // Regular registration for other roles
        console.log('Sending regular registration request for role:', userData.role);
        const { data } = await axios.post(`${API_BASE_URL}${this.basePath}/register`, userData, {
          withCredentials: true
        });
        
        console.log('Registration response:', data);
        if (data.error) {
          console.error('Registration failed with error:', data.message);
          throw new Error(data.message || 'Registration failed');
        }
        
        console.log('Registration completed successfully');
        return data.data;
      }
    } catch (error: any) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // Check for network errors
      if (!error.response) {
        console.error('Network error during registration - API server might be down');
        throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please check your internet connection.`);
      }
      
      // Handle specific status codes
      if (error.response) {
        const status = error.response.status;
        if (status === 400) {
          throw new Error(error.response.data.message || 'Invalid registration data provided');
        } else if (status === 409) {
          throw new Error(error.response.data.message || 'Account with this email already exists');
        } else if (status === 500) {
          throw new Error('Server error: The registration could not be completed due to a server issue. Please try again later.');
        }
        
        throw new Error(error.response.data.message || 'Registration failed');
      }
      
      throw error;
    }
  }

  async login(credentials: SignInData): Promise<{ user: UserResponse; token: string }> {
    try {
      console.log('Making login request to:', `${API_BASE_URL}${this.basePath}/login`);
      console.log('Login credentials (email):', credentials.email);
      console.log('Password length:', credentials.password ? credentials.password.length : 0);
      
      const { data } = await axios.post(`${API_BASE_URL}${this.basePath}/login`, credentials);
      console.log('Server response:', data);

      if (data.error) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (!data.data || !data.data.token || !data.data.user) {
        throw new Error('Invalid response format from server');
      }
      
      // Validate user data has required fields
      const userData = data.data.user;
      if (!userData.id || !userData.email || !userData.role) {
        console.error('Received invalid user data from server:', userData);
        throw new Error('Invalid user data received from server');
      }
      
      // Check and ensure student users have studentId
      const enhancedUserData = checkStudentId(userData);
      
      // Store token and user data
      if (data.data.token) {
        // Use saveAuthToken utility to set token in localStorage and API client
        saveAuthToken(data.data.token);
        
        // Set the token for the current axios instance
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
        
        // Store user data with enhanced user data that includes studentId if needed
        localStorage.setItem('user', JSON.stringify(enhancedUserData));
        
        // Dispatch custom event to notify the app of authentication state change
        this.dispatchAuthEvent({ user: enhancedUserData, action: 'login' });
        
        console.log('Auth token and user data saved, authentication event dispatched');
      }
      
      // Return the enhanced user data
      return {
        user: enhancedUserData,
        token: data.data.token
      };
    } catch (error: any) {
      console.error('Login error in service:', error);
      
      // Improved error handling with specific messages
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.response.status === 403) {
          throw new Error('Account not verified. Please check your email for verification link.');
        } else if (error.response.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw new Error(error.response.data?.message || 'Login failed. Please try again.');
        }
      }
      
      // Network errors
      if (error.message?.includes('Network Error')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const { data } = await axios.post(`${API_BASE_URL}${this.basePath}/forgot-password`, { email });
      if (data.error) {
        throw new Error(data.message || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to send password reset email');
      }
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const { data } = await axios.post(`${API_BASE_URL}${this.basePath}/reset-password`, {
        token,
        newPassword,
      });
      if (data.error) {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to reset password');
      }
      throw error;
    }
  }

  logout(): void {
    // Clear all auth data using removeAuthToken utility
    removeAuthToken();
    
    // Remove user data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Clear auth headers
    delete axios.defaults.headers.common['Authorization'];
    
    // Dispatch custom event to notify the app of logout
    this.dispatchAuthEvent({ action: 'logout' });
    
    console.log('Logout completed, all auth data cleared');
  }

  getCurrentUser(): UserResponse | null {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      
      // Basic validation
      if (!user || !user.id || !user.email || !user.role) {
        console.warn('Invalid user data found in localStorage');
        this.logout(); // Clear invalid data
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error parsing user data', error);
      this.logout(); // Clear corrupt data
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
  
  isTokenExpired(token: string): boolean {
    try {
      // Extract the payload from the JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if token has an expiration time
      if (!payload.exp) {
        return false; // If no expiration, consider token valid
      }
      
      // Check if token is expired
      const expirationTime = payload.exp * 1000; // Convert from seconds to milliseconds
      const currentTime = Date.now();
      
      return expirationTime < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't verify, consider it expired for safety
    }
  }
  
  // Helper method to dispatch auth events
  private dispatchAuthEvent(detail: { user?: UserResponse, action: 'login' | 'logout' | 'update' }): void {
    try {
      const event = new CustomEvent('auth-state-changed', { 
        detail,
        bubbles: true,
        cancelable: true
      });
      
      console.log(`Dispatching auth event: ${detail.action}`, detail.user?.email || '');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error dispatching auth event:', error);
    }
  }
}

export const authService = new AuthService();
export default authService;
