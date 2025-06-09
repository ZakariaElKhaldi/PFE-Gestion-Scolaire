// API configuration settings

// Base URL for API requests
export const API_BASE_URL = 'http://localhost:3001/api';

// Default request timeout in milliseconds
export const API_TIMEOUT = 30000;

// API version
export const API_VERSION = 'v1';

// Authentication header name
export const AUTH_HEADER = 'Authorization';

// API configuration object
export const API_CONFIG = {
  API_URL: API_BASE_URL,
  TIMEOUT: API_TIMEOUT,
  VERSION: API_VERSION,
  AUTH_HEADER: AUTH_HEADER,
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/upload-avatar',
  },
  
  // Course endpoints
  COURSES: {
    BASE: '/courses',
    ENROLLMENTS: '/courses/enrollments',
    MATERIALS: '/courses/materials',
    ASSIGNMENTS: '/courses/assignments',
  },
  
  // Enrollment endpoints
  ENROLLMENTS: {
    BASE: '/enrollments',
    STUDENT: '/enrollments/student',
  },
  
  // Payment endpoints
  PAYMENTS: {
    BASE: '/payments',
    STUDENT: '/payments/student',
    SUMMARY: '/payments/summary',
    INVOICES: '/payments/invoices',
    METHODS: '/payments/methods',
    PROCESS: '/payments/process',
  },
  
  // Certificate endpoints
  CERTIFICATES: {
    BASE: '/certificates',
    STUDENT: '/certificates/student',
    VERIFY: '/certificates/verify',
    DOWNLOAD: '/certificates/download',
  },
};

export default API_CONFIG; 