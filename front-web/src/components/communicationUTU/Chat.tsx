import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Avatar from './Avatar';

const Chat: React.FC = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChat();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-800">Professional Chat</h1>
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">Beta</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
            <Avatar src={currentUser.avatar} alt={currentUser.name} online={true} size="sm" />
          </div>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto my-4 flex overflow-hidden rounded-lg shadow-lg bg-white">
        {/* Sidebar with users */}
        <div className="w-80 border-r bg-gray-50">
          <UserList />
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b bg-white flex items-center justify-between">
            <div className="flex items-center">
              {selectedUser ? (
                <>
                  <Avatar src={selectedUser.avatar} alt={selectedUser.name} online={selectedUser.online} />
                  <div className="ml-3">
                    <h2 className="text-lg font-medium text-gray-800">{selectedUser.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedUser.online ? 'Online' : `Last seen ${selectedUser.lastSeen}`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h2 className="text-lg font-medium text-gray-800">Team Chat</h2>
                    <p className="text-sm text-gray-500">Everyone in the project</p>
                  </div>
                </>
              )}
            </div>
            
            {selectedUser && (
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <span className="sr-only">Close private chat</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Messages */}
          <MessageList />
          
          {/* Input */}
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default Chat;
