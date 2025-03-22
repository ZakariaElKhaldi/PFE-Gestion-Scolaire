/**
 * Result of a validation operation
 */
export interface ValidationResult {
  /**
   * Indicates if the validation passed
   */
  isValid: boolean;
  
  /**
   * Optional array of error messages if validation failed
   */
  errors?: string[];
}

/**
 * Generic pagination result
 */
export interface PaginatedResult<T> {
  /**
   * Array of items for the current page
   */
  items: T[];
  
  /**
   * Total number of items across all pages
   */
  total: number;
  
  /**
   * Current page number
   */
  page: number;
  
  /**
   * Number of items per page
   */
  limit: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Indicates if there is a next page
   */
  hasNextPage: boolean;
  
  /**
   * Indicates if there is a previous page
   */
  hasPrevPage: boolean;
}

/**
 * Generic response format
 */
export interface ApiResponse<T = any> {
  /**
   * Indicates if the request resulted in an error
   */
  error: boolean;
  
  /**
   * Optional data returned by the request
   */
  data?: T;
  
  /**
   * Optional message describing the result
   */
  message?: string;
  
  /**
   * Optional metadata
   */
  meta?: any;
}

/**
 * Health status of a system component
 */
export type ComponentStatus = 'healthy' | 'degraded' | 'unhealthy';

/**
 * Service health information
 */
export interface HealthStatus {
  /**
   * Overall status of the system
   */
  status: ComponentStatus;
  
  /**
   * Timestamp when the health check was performed
   */
  timestamp: string;
  
  /**
   * Status of individual components
   */
  components: {
    database?: {
      status: ComponentStatus;
      message?: string;
    };
    disk?: {
      status: ComponentStatus;
      message?: string;
      usage?: number;
    };
    memory?: {
      status: ComponentStatus;
      message?: string;
      usage?: number;
    };
  };
} 