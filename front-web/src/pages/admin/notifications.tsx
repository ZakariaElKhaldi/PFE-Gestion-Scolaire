import { useState } from 'react';
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout';
import { UserResponse } from '../../types/auth';
import { Bell, Check, X } from 'lucide-react';

interface NotificationsPageProps {
  user: UserResponse;
}

export const NotificationsPage = ({ user }: NotificationsPageProps) => {
  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New User Registration',
      message: 'John Doe has registered as a new student.',
      date: '2023-06-15T10:30:00',
      read: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of $500 received from Sarah Johnson.',
      date: '2023-06-14T14:45:00',
      read: true,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'The system will be updated on June 20th at 22:00. Expect 30 minutes of downtime.',
      date: '2023-06-13T09:15:00',
      read: false,
    },
    {
      id: '4',
      title: 'New Course Added',
      message: 'A new course "Advanced Mathematics" has been added to the curriculum.',
      date: '2023-06-12T11:20:00',
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout user={user}>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <div className="text-sm text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread notifications
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mr-4 mt-1">
                    <Bell
                      className={`h-5 w-5 ${
                        !notification.read ? 'text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(notification.date)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                  <div className="flex ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-green-500 hover:bg-green-50 rounded-full"
                        title="Mark as read"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded-full ml-1"
                      title="Delete notification"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                You don't have any notifications at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}; 