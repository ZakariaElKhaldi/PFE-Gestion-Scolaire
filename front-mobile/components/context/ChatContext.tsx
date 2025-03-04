import React, { createContext, useContext, useState } from 'react';
import { User, Message, ChatRoom } from '@/types/chat';

const mockUsers: User[] = [
  { id: '1', name: 'John Smith', avatar: 'https://ui-avatars.com/api/?name=John+Smith', online: true },
  { id: '2', name: 'Emma Johnson', avatar: 'https://ui-avatars.com/api/?name=Emma+Johnson', online: true },
  { id: '3', name: 'Michael Brown', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown', online: false, lastSeen: '2 hours ago' },
  { id: '4', name: 'Sarah Davis', avatar: 'https://ui-avatars.com/api/?name=Sarah+Davis', online: true },
  { id: '5', name: 'David Wilson', avatar: 'https://ui-avatars.com/api/?name=David+Wilson', online: false, lastSeen: '1 day ago' },
];

const mockMessages: Message[] = [
  { id: '1', content: 'Hello team, how is everyone?', senderId: '1', receiverId: null, timestamp: '2023-06-15T09:00:00', read: true },
  { id: '2', content: 'Doing great!', senderId: '2', receiverId: null, timestamp: '2023-06-15T09:01:30', read: true },
  { id: '3', content: 'Started on the project requirements.', senderId: '4', receiverId: null, timestamp: '2023-06-15T09:05:00', read: true },
];

const mockChatRoom: ChatRoom = {
  id: '1',
  name: 'Project Alpha Team',
  users: mockUsers,
  messages: mockMessages,
};

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

  const onlineUsers = chatRoom.users.filter(user => user.online && user.id !== currentUser.id);
  const offlineUsers = chatRoom.users.filter(user => !user.online && user.id !== currentUser.id);

  const filteredMessages = chatRoom.messages.filter(message => {
    if (selectedUser) {
      return (message.senderId === currentUser.id && message.receiverId === selectedUser.id) ||
             (message.senderId === selectedUser.id && message.receiverId === currentUser.id);
    }
    return message.receiverId === null;
  });

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
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
