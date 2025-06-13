import { useEffect, useRef, useState } from "react"
import { MessageSquare, Loader, Bot } from "lucide-react"
import { Message } from "../../../types/models"
import { ChatHeader } from "./ChatHeader"
import { MessageBubble } from "./MessageBubble"
import { MessageGroup } from "./MessageGroup"
import { MessageInput } from "./MessageInput"
import { messageService } from "../../../services/message-service"

interface ConversationViewProps {
  messages: Message[]
  currentUserId: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string | null
  isLoading: boolean
  onSendMessage: (content: string) => void
  onBackClick?: () => void
}

export function ConversationView({
  messages,
  currentUserId,
  recipientId,
  recipientName,
  recipientAvatar,
  isLoading,
  onSendMessage,
  onBackClick,
}: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false);
  const isAI = recipientId === "ai-assistant-1";

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Define subject for the first message in the conversation
  const getSubjectForMessage = (message: Message, index: number) => {
    // Only first message of a consecutive sequence from same sender shows subject
    if (index === 0) return message.subject

    const prevMessage = messages[index - 1]
    if (prevMessage.senderId !== message.senderId) return message.subject

    return "" // Don't show subject for consecutive messages from same sender
  }
  
  // Force the current user ID for mock data
  const mockUserId = 'teacher-1';
  
  // Use the messages directly - they already have isMine set correctly
  const processedMessages = messages;

  // Handle sending message to AI
  const handleSendMessage = async (content: string) => {
    // First, call the regular onSendMessage to update UI immediately
    onSendMessage(content);
    
    // For AI Assistant, add typing indicator and simulate a delay
    if (isAI) {
      setIsTyping(true);
      
      // Wait for the AI response (handled by parent component)
      // This is just for UI feedback
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat header with recipient info */}
      <ChatHeader
        name={recipientName}
        avatar={recipientAvatar}
        isAI={isAI}
        onBackClick={onBackClick}
      />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-500 mb-3"></div>
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : processedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="rounded-full bg-blue-50 p-5 mb-4">
              {isAI ? (
                <Bot className="h-8 w-8 text-blue-500" />
              ) : (
                <MessageSquare className="h-8 w-8 text-blue-500" />
              )}
            </div>
            <h3 className="font-medium text-gray-900">No messages yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              {isAI 
                ? `Start chatting with the AI Assistant to get help with courses, assignments, or school policies.`
                : `Start the conversation by sending a message to ${recipientName}.`
              }
            </p>
            <div className="mt-4 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
              {isAI ? (
                <Bot className="w-10 h-10 text-blue-300" />
              ) : (
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            {/* Group messages by sender */}
            {(() => {
              const messageGroups: Array<{
                id: string;
                messages: Message[];
                isMine: boolean;
                isFromAI: boolean;
                senderName: string;
              }> = [];
              
              let currentGroup: Message[] = [];
              let currentSender: string | null = null;
              
              processedMessages.forEach((message, index) => {
                // Explicitly determine message ownership by comparing sender ID with current user ID
                const messageBelongsToCurrentUser = message.senderId === currentUserId;
                
                // If this is the first message or sender changed
                if (index === 0 || currentSender !== message.senderId) {
                  // Save the previous group if it exists
                  if (currentGroup.length > 0) {
                    // Use the sender ID comparison instead of message.isMine
                    const isCurrentUserMessage = currentGroup[0].senderId === currentUserId;
                    
                    messageGroups.push({
                      id: `group-${currentGroup[0].id}`,
                      messages: currentGroup,
                      isMine: isCurrentUserMessage,
                      isFromAI: !isCurrentUserMessage && isAI,
                      senderName: recipientName
                    });
                  }
                  
                  // Start a new group
                  currentGroup = [message];
                  currentSender = message.senderId;
                } else {
                  // Add to current group if sender is the same
                  currentGroup.push(message);
                }
              });
              
              // Add the last group
              if (currentGroup.length > 0) {
                // Use the sender ID comparison for the last group too
                const isCurrentUserMessage = currentGroup[0].senderId === currentUserId;
                
                messageGroups.push({
                  id: `group-${currentGroup[0].id}`,
                  messages: currentGroup,
                  isMine: isCurrentUserMessage,
                  isFromAI: !isCurrentUserMessage && isAI,
                  senderName: recipientName
                });
              }
              
              return messageGroups.map(group => (
                <MessageGroup 
                  key={group.id}
                  messages={group.messages}
                  isMine={group.isMine}
                  isFromAI={group.isFromAI}
                  senderName={group.senderName}
                />
              ));
            })()}
            
            {/* AI typing indicator */}
            {isTyping && (
              <div className="w-full flex justify-start mb-2">
                <div className="max-w-[80%] bg-gray-100 px-4 py-3 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm flex items-center space-x-2">
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
        )}
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 p-3">
        <MessageInput
          onSendMessage={handleSendMessage}
          placeholder={`Message ${isAI ? 'AI Assistant' : recipientName}...`}
          disabled={isLoading}
          isAI={isAI}
        />
      </div>
    </div>
  )
} 