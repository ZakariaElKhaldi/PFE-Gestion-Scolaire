import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, AUTH_STORAGE_KEY, FEATURES } from './config';

interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export class ApiClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_STORAGE_KEY);
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers = { ...this.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Enhanced logging for debugging
    console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log(`Backend enabled: ${FEATURES.enableBackend}`);
    
    // If backend is disabled, throw a specific error that will be caught by the service
    if (!FEATURES.enableBackend) {
      console.log('Using mock data (backend disabled)');
      throw new Error('MOCK_DATA');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      console.log(`Fetching from: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const error = await response.json();
          errorMessage = error.message || 'An error occurred';
        } catch (e) {
          // If there's an error parsing the JSON, use the status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        console.error(`API Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'MOCK_DATA') {
          throw error; // Let the service handle mock data
        }
        // Enhanced error logging
        console.error(`API Request Error: ${error.message}`);
        throw new Error(`API Request Failed: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>) {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async setAuthToken(token: string) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
  }

  async removeAuthToken() {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export const apiClient = new ApiClient({
  baseURL: API_URL,
}); 