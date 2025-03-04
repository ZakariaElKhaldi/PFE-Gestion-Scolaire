import React from 'react';
import { User } from '@/types/chat';
import Avatar from './Avatar';
import { useChat } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';

const UserList: React.FC = () => {
  const { onlineUsers, offlineUsers, selectedUser, setSelectedUser } = useChat();

  const handleUserSelect = (user: User) => {
    setSelectedUser(user.id === selectedUser?.id ? null : user);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Team Members</h2>
        <p className="text-sm text-gray-500">
          Select a user to start a private chat
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Online — {onlineUsers.length}
            </h3>
            <span className="w-2 h-2 bg-success rounded-full"></span>
          </div>
          
          {onlineUsers.map(user => (
            <div 
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={cn(
                "flex items-center p-3 rounded-lg mb-1 cursor-pointer hover:bg-gray-100 transition-colors",
                selectedUser?.id === user.id ? "bg-primary/10 hover:bg-primary/15" : ""
              )}
            >
              <Avatar src={user.avatar} alt={user.name} online={true} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Offline — {offlineUsers.length}
            </h3>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
          
          {offlineUsers.map(user => (
            <div 
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={cn(
                "flex items-center p-3 rounded-lg mb-1 cursor-pointer hover:bg-gray-100 transition-colors",
                selectedUser?.id === user.id ? "bg-primary/10 hover:bg-primary/15" : ""
              )}
            >
              <Avatar src={user.avatar} alt={user.name} online={false} />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">Last seen {user.lastSeen}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserList;
