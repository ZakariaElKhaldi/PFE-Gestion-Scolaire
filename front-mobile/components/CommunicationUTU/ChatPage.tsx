import React from 'react';
import Chat from './Chat';
import Avatar from './Avatar';
import UserList from './UserList';
import { ChatProvider } from '../context/ChatContext'; // Adjust based on actual relative path

const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};

export default ChatPage;
