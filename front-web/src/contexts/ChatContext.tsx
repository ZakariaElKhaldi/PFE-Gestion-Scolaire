import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Message, ChatRoom } from '@/types/chat';

// Mock data for initial state
const mockUsers: User[] = [
  { id: '1', name: 'John Smith', avatar: '/avatars/john.jpg', online: true },
  { id: '2', name: 'Emma Johnson', avatar: '/avatars/emma.jpg', online: true },
  { id: '3', name: 'Michael Brown', avatar: '/avatars/michael.jpg', online: false, lastSeen: '2 hours ago' },
  { id: '4', name: 'Sarah Davis', avatar: '/avatars/sarah.jpg', online: true },
  { id: '5', name: 'David Wilson', avatar: '/avatars/david.jpg', online: false, lastSeen: '1 day ago' },
];

const mockMessages: Message[] = [
  { id: '1', content: 'Hello team, how is everyone doing today?', senderId: '1', receiverId: null, timestamp: '2023-06-15T09:00:00', read: true },
  { id: '2', content: 'Doing great, thanks for asking!', senderId: '2', receiverId: null, timestamp: '2023-06-15T09:01:30', read: true },
  { id: '3', content: 'Has anyone started on the new project requirements?', senderId: '4', receiverId: null, timestamp: '2023-06-15T09:05:00', read: true },
  { id: '4', content: 'I\'ll be sending you a private update shortly', senderId: '1', receiverId: '4', timestamp: '2023-06-15T09:07:00', read: true },
  { id: '5', content: 'Here\'s the update on the project timeline.', senderId: '1', receiverId: '4', timestamp: '2023-06-15T09:10:00', read: true },
];

const mockChatRoom: ChatRoom = {
  id: '1',
  name: 'Project Alpha Team',
  users: mockUsers,
  messages: mockMessages,
};

// Current user (the user using the app)
const currentUser: User = mockUsers[0];

interface ChatContextType {
  currentUser: User;
  chatRoom: ChatRoom;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  sendMessage: (content: string, receiverId: string | null) => void;
  filteredMessages: Message[];
  onlineUsers: User[];
  offlineUsers: User[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRoom, setChatRoom] = useState<ChatRoom>(mockChatRoom);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Split users into online and offline
  const onlineUsers = chatRoom.users.filter(user => user.online && user.id !== currentUser.id);
  const offlineUsers = chatRoom.users.filter(user => !user.online && user.id !== currentUser.id);

  // Filter messages based on selectedUser
  const filteredMessages = chatRoom.messages.filter(message => {
    if (selectedUser) {
      // Private messages between current user and selected user
      return (message.senderId === currentUser.id && message.receiverId === selectedUser.id) ||
             (message.senderId === selectedUser.id && message.receiverId === currentUser.id);
    } else {
      // Broadcast messages (receiverId is null)
      return message.receiverId === null;
    }
  });

  // Function to send a new message
  const sendMessage = (content: string, receiverId: string | null) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: currentUser.id,
      receiverId,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setChatRoom(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  return (
    <ChatContext.Provider value={{
      currentUser,
      chatRoom,
      selectedUser,
      setSelectedUser,
      sendMessage,
      filteredMessages,
      onlineUsers,
      offlineUsers,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
