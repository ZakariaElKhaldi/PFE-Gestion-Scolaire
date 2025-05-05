import { useState } from 'react';
import { User } from '../../../types/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Bell, CheckCircle2, Clock, Info, AlertTriangle } from 'lucide-react';

interface NotificationsPageProps {
  user: User;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  isRead: boolean;
}

export const NotificationsPage = ({ user }: NotificationsPageProps) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'New Assignment Posted',
      message: 'A new assignment has been posted in Mathematics.',
      type: 'info',
      timestamp: '2024-03-08T10:00:00Z',
      isRead: false,
    },
    {
      id: '2',
      title: 'Grade Updated',
      message: 'Your grade for Physics Quiz 2 has been updated.',
      type: 'success',
      timestamp: '2024-03-07T15:30:00Z',
      isRead: true,
    },
    {
      id: '3',
      title: 'Upcoming Deadline',
      message: 'Assignment deadline approaching for History Essay.',
      type: 'warning',
      timestamp: '2024-03-07T09:15:00Z',
      isRead: false,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredNotifications.map(notification => (
          <Card key={notification.id} className={notification.isRead ? 'bg-white' : 'bg-blue-50'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{notification.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(notification.timestamp)}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No notifications</CardTitle>
              <p className="text-gray-500">
                {activeTab === 'unread'
                  ? "You've read all your notifications"
                  : "You don't have any notifications yet"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
