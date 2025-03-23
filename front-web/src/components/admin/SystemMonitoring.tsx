import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Server, Database, HardDrive } from 'lucide-react';
import { adminService, SystemMetrics } from '../../services/admin.service';

interface SystemMonitoringProps {
  refreshInterval?: number; // in milliseconds
}

export const SystemMonitoring = ({ refreshInterval = 30000 }: SystemMonitoringProps) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getSystemMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load system metrics');
      console.error('Error fetching system metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Set up polling for periodic updates
    const intervalId = setInterval(fetchMetrics, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Helper functions for formatting
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (isLoading && !metrics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Monitoring</CardTitle>
            <CardDescription>Loading system metrics...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">System Monitoring Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={fetchMetrics}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Usage Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Server className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">CPU Usage</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics?.cpu.usage}%
                    </div>
                  </dd>
                </dl>
                <div className="mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metrics?.cpu.usage && metrics.cpu.usage > 80 ? 'bg-red-500' : 
                        metrics?.cpu.usage && metrics.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} 
                      style={{ width: `${metrics?.cpu.usage || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {metrics?.cpu.cores} Cores • Uptime: {metrics && formatUptime(metrics.system.uptime)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Memory Usage</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics?.memory.percentUsed}%
                    </div>
                  </dd>
                </dl>
                <div className="mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metrics?.memory.percentUsed && metrics.memory.percentUsed > 80 ? 'bg-red-500' : 
                        metrics?.memory.percentUsed && metrics.memory.percentUsed > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`} 
                      style={{ width: `${metrics?.memory.percentUsed || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {metrics && formatBytes(metrics.memory.used)} / {metrics && formatBytes(metrics.memory.total)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disk Usage Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HardDrive className="h-8 w-8 text-amber-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Disk Usage</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics?.storage.percentUsed}%
                    </div>
                  </dd>
                </dl>
                <div className="mt-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        metrics?.storage.percentUsed && metrics.storage.percentUsed > 80 ? 'bg-red-500' : 
                        metrics?.storage.percentUsed && metrics.storage.percentUsed > 60 ? 'bg-yellow-500' : 'bg-amber-500'
                      }`} 
                      style={{ width: `${metrics?.storage.percentUsed || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {metrics && formatBytes(metrics.storage.used)} / {metrics && formatBytes(metrics.storage.total)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Details about the server environment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Hostname</h4>
              <p className="mt-1 text-sm text-gray-900">{metrics?.system.hostname}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Platform</h4>
              <p className="mt-1 text-sm text-gray-900">{metrics?.system.platform} ({metrics?.system.arch})</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Node.js Version</h4>
              <p className="mt-1 text-sm text-gray-900">{metrics?.process.version}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Database</h4>
              <p className="mt-1 text-sm text-gray-900">
                {metrics?.database.activeConnections} active connections • {metrics?.database.sizeMB.toFixed(2)} MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-gray-500 text-right">
        Last updated: {metrics?.timestamp ? new Date(metrics.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
}; 