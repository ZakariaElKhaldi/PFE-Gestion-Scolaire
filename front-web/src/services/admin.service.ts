import { apiClient } from '../lib/api-client';

/**
 * Type for system metrics
 */
export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number | null;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentUsed: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    percentUsed: number;
  };
  system: {
    uptime: number;
    hostname: string;
    platform: string;
    release: string;
    arch: string;
  };
  process: {
    uptime: number;
    memory: any;
    pid: number;
    version: string;
  };
  database: {
    activeConnections: number;
    sizeMB: number;
  };
  timestamp: string;
}

/**
 * Get system metrics (admin only)
 */
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const response = await apiClient.get<SystemMetrics>('/admin/system/metrics');
  return response.data;
};

/**
 * Admin service containing all admin-related API functions
 */
export const adminService = {
  getSystemMetrics,
  // Add other admin-specific functions here
}; 