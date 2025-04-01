import React from "react"
import { MessageBubble } from "./MessageBubble"
import { Message } from "../../../types/models"

interface MessageGroupProps {
  messages: Message[]
  isMine: boolean
  isFromAI?: boolean
  senderName?: string
}

export function MessageGroup({ messages, isMine, isFromAI = false, senderName }: MessageGroupProps) {
  if (!messages.length) return null;
  
  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-4 gap-1`}>
      {/* Optional avatar or sender name for first message in group */}
      {!isMine && messages.length > 0 && (
        <div className="text-xs text-gray-500 ml-2 mb-1">
          {isFromAI ? 'AI Assistant' : senderName || 'Unknown'}
        </div>
      )}
      
      {/* Messages */}
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={{
            ...message,
            // Only show subject on first message in group
            subject: index === 0 ? (message.subject || '') : ''
          }}
          isMine={isMine}
          isFromAI={isFromAI}
        />
      ))}
    </div>
  )
} 