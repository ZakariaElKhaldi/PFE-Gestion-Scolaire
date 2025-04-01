import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { HardDrive } from 'lucide-react';

interface SystemMetricsProps {
  cpuUsage: string;
  memoryUsage: string;
  diskUsage: string;
  activeUsers: number;
  uptime: string;
  lastBackup: string;
  databaseSize: string;
  onBackupClick: () => void;
}

export const SystemStatusCard = ({
  cpuUsage,
  memoryUsage,
  diskUsage,
  activeUsers,
  uptime,
  lastBackup,
  databaseSize,
  onBackupClick,
}: SystemMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>Current system metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">CPU Usage</span>
            <span className="text-sm font-medium">{cpuUsage}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: cpuUsage }}></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Memory Usage</span>
            <span className="text-sm font-medium">{memoryUsage}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: memoryUsage }}></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Disk Usage</span>
            <span className="text-sm font-medium">{diskUsage}</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: diskUsage }}></div>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Users</span>
            <Badge variant="outline">{activeUsers}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Uptime</span>
            <Badge variant="outline">{uptime}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Last Backup</span>
            <Badge variant="outline">{lastBackup}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Database Size</span>
            <Badge variant="outline">{databaseSize}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline" onClick={onBackupClick}>
          <HardDrive className="h-4 w-4 mr-2" />
          Backup System
        </Button>
      </CardFooter>
    </Card>
  );
}; 