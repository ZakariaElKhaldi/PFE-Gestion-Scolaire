import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { AiProfileService } from '../../../services/ai-profile.service';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  supportWaitingTime?: number; // Time in seconds before AI intervenes (default: 10s)
  onHumanSupportRequest?: () => void;
}

export function AIAssistant({ 
  supportWaitingTime = 10,
  onHumanSupportRequest 
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supportTimerRef = useRef<NodeJS.Timeout | null>(null);

  // When component mounts, introduce the AI assistant
  useEffect(() => {
    setMessages([
      {
        id: 'init-1',
        type: 'system',
        content: 'Welcome to student support. How can I help you today?',
        timestamp: new Date()
      }
    ]);

    // Set up timer for AI to intervene if no response
    supportTimerRef.current = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            type: 'ai',
            content: "I notice you've been waiting. Our support team will be with you shortly. In the meantime, I'm an AI assistant and might be able to help with your question. What do you need assistance with?",
            timestamp: new Date()
          }
        ]);
      }, 1500);
    }, supportWaitingTime * 1000);
    
    return () => {
      if (supportTimerRef.current) {
        clearTimeout(supportTimerRef.current);
      }
    };
  }, [supportWaitingTime]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Reset support waiting timer if exists
    if (supportTimerRef.current) {
      clearTimeout(supportTimerRef.current);
      supportTimerRef.current = null;
    }
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // If the message contains specific keywords, offer human support
      const humanSupportKeywords = ['human', 'real person', 'agent', 'speak to someone', 'talk to support'];
      if (humanSupportKeywords.some(keyword => inputMessage.toLowerCase().includes(keyword))) {
        setTimeout(() => {
          setIsLoading(false);
          setIsTyping(true);
          
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [
              ...prev,
              {
                id: `ai-${Date.now()}`,
                type: 'ai',
                content: "I understand you'd like to speak with a human agent. Let me connect you to our support team. Please wait a moment while I transfer your chat.",
                timestamp: new Date()
              }
            ]);
            
            // Notify parent about human support request
            if (onHumanSupportRequest) {
              setTimeout(onHumanSupportRequest, 1500);
            }
          }, 1500);
        }, 1000);
        return;
      }
      
      // Process message with AI Profiles service
      setIsTyping(true);
      
      // Add a little delay to make it feel more natural
      setTimeout(async () => {
        try {
          const response = await AiProfileService.queryProfile(inputMessage);
          
          setIsTyping(false);
          setMessages(prev => [
            ...prev, 
            {
              id: `ai-${Date.now()}`,
              type: 'ai',
              content: response.response || "I'm sorry, I couldn't process your request at this time.",
              timestamp: new Date()
            }
          ]);
        } catch (error) {
          console.error('Error querying AI:', error);
          setIsTyping(false);
          setMessages(prev => [
            ...prev,
            {
              id: `ai-error-${Date.now()}`,
              type: 'ai',
              content: "I'm sorry, I'm having trouble processing your request right now. Let me connect you with our support team.",
              timestamp: new Date()
            }
          ]);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error processing message:', error);
      setIsLoading(false);
      setMessages(prev => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: 'system',
          content: "There was an error processing your message. Please try again.",
          timestamp: new Date()
        }
      ]);
    }
  };

  // Handle pressing Enter to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Chat history */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex items-start max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.type === 'ai'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="mr-2 mt-1">
                    {message.type === 'ai' 
                      ? <Bot className="h-4 w-4 text-blue-500" /> 
                      : <span className="inline-block h-4 w-4 rounded-full bg-gray-500" />
                    }
                  </div>
                )}
                <div>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="ml-2 mt-1">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%] flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message input */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none border rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-24"
            placeholder="Type your message..."
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`ml-2 p-2 rounded-full ${
              isLoading || !inputMessage.trim() 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 