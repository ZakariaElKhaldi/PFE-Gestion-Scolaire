const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

interface ApiClientConfig {
  baseURL: string
  headers?: Record<string, string>
}

interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export class ApiClient {
  private baseURL: string
  private headers: Record<string, string>

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL
    this.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    }
    
    // Initialize auth token from localStorage on startup
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get the latest token before each request
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.headers.Authorization = `Bearer ${token}`;
    }
    
    const headers = {
      ...this.headers,
      ...options.headers,
    }

    try {
      console.log(`Making ${options.method || 'GET'} request to: ${url}`);
      console.log('Headers:', headers);
      
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/auth/sign-in';
          throw new Error('Authentication required');
        }
        
        const error = await response.json();
        throw new Error(error.message || "An error occurred");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred");
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>) {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : ""
    return this.request<T>(`${endpoint}${queryString}`, {
      method: "GET",
    })
  }

  async post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: "DELETE",
    })
  }

  setAuthToken(token: string) {
    this.headers.Authorization = `Bearer ${token}`
  }

  removeAuthToken() {
    delete this.headers.Authorization
  }
}

export const apiClient = new ApiClient({
  baseURL: API_BASE_URL,
})

export default apiClient;

// Add token management from localStorage
export const initializeAuth = () => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    console.log('Initializing API client with auth token from localStorage');
    apiClient.setAuthToken(token);
    
    // Add a custom event listener for auth state changes
    window.addEventListener('auth-state-changed', ((event: CustomEvent) => {
      console.log('Auth state changed event received in api-client');
      if (event.detail?.action === 'login' && event.detail?.user) {
        // Ensure token is set after login
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('Setting auth token after login event');
          apiClient.setAuthToken(token);
        }
      } else if (event.detail?.action === 'logout') {
        console.log('Removing auth token after logout event');
        apiClient.removeAuthToken();
      }
    }) as EventListener);
  } else {
    console.log('No auth token found during API client initialization');
  }
  
  // Return function to remove event listener (for cleanup)
  return () => {
    window.removeEventListener('auth-state-changed', (() => {}) as EventListener);
  };
};

// Save token to localStorage
export const saveAuthToken = (token: string) => {
  console.log('Saving auth token to localStorage and API client');
  localStorage.setItem('auth_token', token);
  apiClient.setAuthToken(token);
};

// Remove token from localStorage
export const removeAuthToken = () => {
  console.log('Removing auth token from localStorage and API client');
  localStorage.removeItem('auth_token');
  apiClient.removeAuthToken();
};