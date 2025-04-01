import { pool } from '../config/db';
import { logger } from './logger';
import { checkMigrations } from '../db/migrations';
import fs from 'fs';
import path from 'path';
import os from 'os';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number; // in seconds
  timestamp: string;
  database: {
    connected: boolean;
    migrated: boolean;
  };
  memory: {
    free: number; // in MB
    total: number; // in MB
    usage: number; // percentage
  };
  disk: {
    free: number; // in MB for uploads directory
    writable: boolean;
  };
}

// Server start time
const startTime = Date.now();
const serverVersion = '1.0.1';

/**
 * Get system health status
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  // Check database connection
  let dbConnected = false;
  let dbMigrated = false;
  
  try {
    const connection = await pool.getConnection();
    dbConnected = true;
    connection.release();
    
    // Check migrations
    dbMigrated = await checkMigrations();
  } catch (error) {
    logger.error('Health check - Database connection failed', error);
  }
  
  // Check disk space for uploads directory
  let diskFree = 0;
  let diskWritable = false;
  
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Check if the directory is writable by creating a test file
    const testFile = path.join(uploadsDir, '.health-check-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    diskWritable = true;
    
    // Get disk space stats
    if (process.platform !== 'win32') {
      // This only works reliably on Unix systems
      const { exec } = require('child_process');
      const stdout = await new Promise<string>((resolve, reject) => {
        exec(`df -k "${uploadsDir}"`, (error: Error, stdout: string) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      });
      
      const lines = stdout.trim().split('\n');
      if (lines.length > 1) {
        const parts = lines[1].split(/\s+/);
        if (parts.length >= 4) {
          diskFree = parseInt(parts[3], 10) / 1024; // Convert to MB
        }
      }
    }
  } catch (error) {
    logger.error('Health check - Disk check failed', error);
  }
  
  // Get memory usage
  const freeMem = Math.round(os.freemem() / (1024 * 1024));
  const totalMem = Math.round(os.totalmem() / (1024 * 1024));
  const memUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
  
  // Determine overall status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (!dbConnected || !diskWritable) {
    status = 'unhealthy';
  } else if (!dbMigrated || memUsage > 90) {
    status = 'degraded';
  }
  
  return {
    status,
    version: serverVersion,
    uptime: Math.round((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      migrated: dbMigrated,
    },
    memory: {
      free: freeMem,
      total: totalMem,
      usage: memUsage,
    },
    disk: {
      free: diskFree,
      writable: diskWritable,
    },
  };
}

/**
 * Check if the system is healthy enough to operate
 */
export async function isSystemOperational(): Promise<boolean> {
  const health = await getHealthStatus();
  return health.status !== 'unhealthy';
} 