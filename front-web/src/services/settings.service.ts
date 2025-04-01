import { apiClient } from '../lib/api-client';
import { UserSettings, SystemSettings, SecuritySettings } from '../types/settings';

const BASE_URL = '/settings';

// User settings endpoints
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>(`${BASE_URL}/user`);
  return response.data;
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  const response = await apiClient.put<UserSettings>(`${BASE_URL}/user`, settings);
  return response.data;
};

// Admin-only endpoints
export const getSystemSettings = async (): Promise<SystemSettings> => {
  const response = await apiClient.get<SystemSettings>(`${BASE_URL}/system`);
  return response.data;
};

export const updateSystemSettings = async (settings: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await apiClient.put<SystemSettings>(`${BASE_URL}/system`, settings);
  return response.data;
};

export const getSecuritySettings = async (): Promise<SecuritySettings> => {
  const response = await apiClient.get<SecuritySettings>(`${BASE_URL}/security`);
  return response.data;
};

export const updateSecuritySettings = async (settings: Partial<SecuritySettings>): Promise<SecuritySettings> => {
  const response = await apiClient.put<SecuritySettings>(`${BASE_URL}/security`, settings);
  return response.data;
};

// Settings service object
export const settingsService = {
  getUserSettings,
  updateUserSettings,
  getSystemSettings,
  updateSystemSettings,
  getSecuritySettings,
  updateSecuritySettings
}; 