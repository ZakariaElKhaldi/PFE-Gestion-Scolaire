import React, { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, selectedUser } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message, selectedUser?.id || null);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-center">
        <button 
          type="button"
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={selectedUser ? `Message ${selectedUser.name}...` : "Message everyone..."}
          className="flex-1 p-3 rounded-full bg-gray-100 focus:bg-white border border-transparent focus:border-gray-300 focus:ring-0 focus:outline-none transition-colors"
        />
        
        <button 
          type="submit" 
          disabled={!message.trim()}
          className="ml-2 p-2 rounded-full bg-primary text-white hover:bg-primary/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
