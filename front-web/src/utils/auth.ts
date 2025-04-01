/**
 * Authentication utility functions
 * This file provides functions to handle auth tokens and headers for API requests
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

/**
 * Get authentication headers for API requests
 * @returns Authorization headers object or empty object if no token is available
 */
export const getAuthHeader = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return {};
  }
  
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Check if the user is authenticated
 * @returns Boolean indicating whether the user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
};

/**
 * Get the current authentication token
 * @returns The current auth token or null if none exists
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set the authentication token
 * @param token The token to store
 */
export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove the authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Check if a token is expired
 * @param token JWT token to check
 * @returns Boolean indicating whether the token is expired
 */
export const isTokenExpired = (token: string): boolean => {
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
}; 