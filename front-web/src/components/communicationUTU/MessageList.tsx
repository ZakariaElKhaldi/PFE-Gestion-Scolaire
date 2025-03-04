import React, { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import Avatar from './Avatar';
import { format } from 'date-fns';

const MessageList: React.FC = () => {
  const { filteredMessages, currentUser, selectedUser } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">
              {selectedUser 
                ? `Start a private conversation with ${selectedUser.name}`
                : "Send a message to the whole team"}
            </p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUser.id;
            const showAvatar = !isCurrentUser && 
                              (index === 0 || 
                               filteredMessages[index - 1].senderId !== message.senderId);
            
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
                  {!isCurrentUser && showAvatar && (
                    <div className="flex-shrink-0 mr-2">
                      <Avatar 
                        src={selectedUser?.avatar || '/avatars/user.jpg'} 
                        alt={selectedUser?.name || 'User'} 
                        size="sm" 
                      />
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isCurrentUser 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
