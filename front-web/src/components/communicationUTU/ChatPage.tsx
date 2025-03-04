import React from 'react';
import Chat from './Chat';
import { ChatProvider } from '@/contexts/ChatContext';

const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};

export default ChatPage;
