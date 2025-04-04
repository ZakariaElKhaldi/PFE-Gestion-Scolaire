import { Platform } from 'react-native';

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 
  // Check if running on a physical device with Expo Go
  (Platform.OS === 'android' || Platform.OS === 'ios') ? 
    // Use your computer's local network IP address
    'http://192.168.1.2:3001/api' : 
    'http://localhost:3001/api';
// export const API_URL = 'http://10.0.2.2:3000/api'; // Android Emulator

// Socket Configuration
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// AI Configuration
export const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
export const AI_MODEL = process.env.EXPO_PUBLIC_AI_MODEL || 'gpt-4-turbo-preview';

// File Upload Configuration
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
];

// Authentication Configuration
export const AUTH_STORAGE_KEY = 'authToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const JWT_SECRET = process.env.EXPO_PUBLIC_JWT_SECRET;
export const JWT_EXPIRY = process.env.EXPO_PUBLIC_JWT_EXPIRY || '7d';

// Cache Configuration
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
export const MAX_CACHE_SIZE = 100; // Maximum number of items to cache

// UI Configuration
export const TOAST_DURATION = 3000; // 3 seconds
export const DEFAULT_ANIMATION_DURATION = 300; // 300ms

// App Information
export const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || 'School Management';
export const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0';

// Feature Flags
export const FEATURES = {
  OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE !== 'false', // Default to true unless explicitly set to 'false'
  DOCUMENT_PREVIEW: true,
  FILE_SHARING: true,
  PUSH_NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS !== 'false', // Default to true unless explicitly set to 'false'
  enableBackend: true, // Always use the real backend by default
};

// For debugging - log feature flags
console.log('Environment variables loaded:');
console.log(`ENABLE_BACKEND: ${process.env.EXPO_PUBLIC_ENABLE_BACKEND}`);
console.log(`FEATURES.enableBackend: ${FEATURES.enableBackend}`);
console.log(`API_URL: ${API_URL}`);

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type not supported.',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  DOWNLOAD_FAILED: 'Failed to download file. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
}; 