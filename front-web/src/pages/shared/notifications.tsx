import React from 'react';
import { UserResponse } from '@/types/auth';

interface NotificationsPageProps {
  user: UserResponse;
}

export const SharedNotificationsPage: React.FC<NotificationsPageProps> = ({ user }) => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="space-y-4">
        {/* Notification content will be added here */}
        <p>No new notifications</p>
      </div>
    </div>
  );
};
