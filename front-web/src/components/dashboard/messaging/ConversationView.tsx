import { useEffect, useRef } from "react"
import { MessageSquare, Loader } from "lucide-react"
import { Message } from "../../../types/models"
import { ChatHeader } from "./ChatHeader"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"

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
  
  // Process messages with consistent sender identification
  const processedMessages = messages.map(message => {
    // IMPORTANT: For mock data, use a consistent check
    // When using mock data, the currentUserId might not match the sender pattern
    const isFromCurrentUser = 
      // Check if message is from current user in multiple ways
      message.senderId === currentUserId || 
      message.senderId === mockUserId || 
      message.isMine === true || 
      // For Re: messages that are replies, they're usually from the current user
      (message.subject && message.subject.startsWith('Re:'));
    
    return {
      ...message,
      // Override everything with boolean values
      senderId: isFromCurrentUser ? mockUserId : message.senderId,
      isMine: Boolean(isFromCurrentUser)
    };
  });

  // Log for debugging
  console.log("Processed messages:", processedMessages.map(m => ({ 
    id: m.id, 
    senderId: m.senderId, 
    isMine: m.isMine,
    content: m.content.substring(0, 20) + "..."
  })));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat header with recipient info */}
      <ChatHeader
        name={recipientName}
        avatar={recipientAvatar}
        onBackClick={onBackClick}
      />

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-500 mb-3"></div>
            <p className="text-sm text-gray-500">Loading messages...</p>
          </div>
        ) : processedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="rounded-full bg-blue-50 p-5 mb-4">
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-900">No messages yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              Start the conversation by sending a message to {recipientName}.
            </p>
            <div className="mt-4 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {processedMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={{
                  ...message,
                  subject: getSubjectForMessage(message, index),
                }}
                isMine={message.isMine === true}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={(content) => onSendMessage(content)}
        placeholder={`Message ${recipientName}...`}
        disabled={isLoading}
      />
    </div>
  )
} 