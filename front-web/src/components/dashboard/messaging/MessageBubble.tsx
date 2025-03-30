import React from "react"
import { formatDistanceToNow } from "date-fns"
import { Check, CheckCheck, Clock } from "lucide-react"
import { Message } from "../../../types/models"

interface MessageBubbleProps {
  message: Message
  isMine: boolean
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  const formatTime = (date: string) => {
    try {
      const messageDate = new Date(date)
      const today = new Date()
      
      // Format to show time only for today's messages
      if (messageDate.toDateString() === today.toDateString()) {
        return messageDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }
      
      // For older messages, show relative time
      return formatDistanceToNow(messageDate, { addSuffix: true })
    } catch (e) {
      return ""
    }
  }

  const getStatusIcon = () => {
    if (!isMine) return null
    
    switch (message.status) {
      case "read":
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      case "delivered":
        return <CheckCheck className="h-4 w-4 text-gray-400" />
      case "sent":
        return <Check className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  // Force right alignment for current user's messages with inline styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    justifyContent: isMine ? 'flex-end' : 'flex-start',
    marginBottom: '8px'
  };

  const bubbleStyle: React.CSSProperties = {
    maxWidth: '70%',
    marginLeft: isMine ? 'auto !important' : '0',
    marginRight: isMine ? '0' : 'auto !important',
    borderRadius: '0.5rem',
    padding: '0.75rem 0.75rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  };

  // Override classes for message bubble
  const bubbleClasses = isMine 
    ? "bg-green-600 text-white rounded-tr-none"
    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none";

  return (
    <div 
      style={containerStyle}
      data-is-mine={isMine ? "true" : "false"} // For debugging
    >
      <div
        style={bubbleStyle}
        className={bubbleClasses}
      >
        {/* Message subject shown only for the first message */}
        {message.subject && (
          <div className={`font-medium text-sm mb-1 ${isMine ? "text-green-50" : "text-gray-700"}`}>
            {message.subject}
          </div>
        )}
        
        {/* Message content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Time and status indicators */}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={`text-xs ${isMine ? "text-green-100" : "text-gray-500"}`}>
            {formatTime(message.sentAt)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
} 