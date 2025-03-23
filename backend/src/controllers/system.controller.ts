import { Request, Response } from 'express';
import os from 'os';
import { pool } from '../config/db';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';

/**
 * Controller for system monitoring and management
 */
export class SystemController {
  /**
   * Get system resource usage metrics
   */
  public async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      // Get CPU usage (average load)
      const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
      const cpuCores = os.cpus().length;
      
      // Get memory usage
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const memoryUsagePercent = (usedMemory / totalMemory) * 100;
      
      // Get system uptime
      const uptime = os.uptime();
      
      // Get process uptime
      const processUptime = process.uptime();
      
      // Calculate disk usage (mock data for now)
      // In a real implementation, you would use a library like 'diskusage'
      // or execute a system command to get actual disk usage
      const diskTotal = 1000000000000; // 1 TB (example value)
      const diskUsed = 400000000000;  // 400 GB (example value)
      const diskFree = diskTotal - diskUsed;
      const diskUsagePercent = (diskUsed / diskTotal) * 100;
      
      // Get active database connections
      const [connectionResult] = await pool.query<RowDataPacket[]>('SHOW STATUS LIKE "Threads_connected"');
      const activeConnections = connectionResult[0]?.Value || 0;
      
      // Get database size (example query - adjust based on your DB)
      const [dbSizeResult] = await pool.query<RowDataPacket[]>(`
        SELECT 
          SUM(data_length + index_length) / 1024 / 1024 AS size_mb 
        FROM 
          information_schema.TABLES 
        WHERE 
          table_schema = DATABASE()`);
      const databaseSizeMB = dbSizeResult[0]?.size_mb || 0;
      
      // Format system metrics
      const metrics = {
        cpu: {
          usage: parseFloat(cpuUsage.toFixed(2)),
          cores: cpuCores,
          temperature: null, // Would require OS-specific implementation
        },
        memory: {
          total: totalMemory,
          used: usedMemory,
          free: freeMemory,
          percentUsed: parseFloat(memoryUsagePercent.toFixed(2)),
        },
        storage: {
          total: diskTotal,
          used: diskUsed,
          free: diskFree,
          percentUsed: parseFloat(diskUsagePercent.toFixed(2)),
        },
        system: {
          uptime,
          hostname: os.hostname(),
          platform: os.platform(),
          release: os.release(),
          arch: os.arch(),
        },
        process: {
          uptime: processUptime,
          memory: process.memoryUsage(),
          pid: process.pid,
          version: process.version,
        },
        database: {
          activeConnections: parseInt(activeConnections as string),
          sizeMB: parseFloat(databaseSizeMB as string),
        },
        timestamp: new Date().toISOString(),
      };
      
      res.status(200).json(metrics);
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      res.status(500).json({ error: 'Failed to retrieve system metrics' });
    }
  }
}

export const systemController = new SystemController(); 