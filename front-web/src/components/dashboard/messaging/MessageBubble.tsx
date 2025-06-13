import React from "react"
import { format, isToday, isYesterday } from "date-fns"
import { Check, CheckCheck, Clock, CheckCircle, Bot } from "lucide-react"
import { Message } from "../../../types/models"

interface MessageBubbleProps {
  message: Message
  isMine: boolean
  isFromAI?: boolean
}

export function MessageBubble({ message, isMine, isFromAI = false }: MessageBubbleProps) {
  // Format the time string from ISO date
  const formatTimeString = (dateString: string) => {
    try {
      const date = new Date(dateString)
      
      if (isToday(date)) {
        return format(date, "HH:mm")
      } else if (isYesterday(date)) {
        return `Yesterday, ${format(date, "HH:mm")}`
      } else {
        return format(date, "MMM d, HH:mm")
      }
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  // For my message (right side, blue)
  if (isMine) {
    return (
      <div className="w-full flex justify-end mb-3">
        <div className="max-w-[80%] bg-primary-100 text-gray-800 px-4 py-3 rounded-tl-2xl rounded-tr-md rounded-bl-2xl rounded-br-2xl shadow-sm">
          {message.subject && (
            <div className="font-medium mb-1 text-primary-700">
              {message.subject}
            </div>
          )}
          
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          <div className="flex items-center justify-end gap-1 mt-1.5">
            <span className="text-xs text-gray-500">
              {formatTimeString(message.sentAt)}
            </span>
            <div className="ml-1">
              {message.status === "read" ? (
                <CheckCircle className="h-3 w-3 text-primary-600" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="h-3 w-3 text-gray-500" />
              ) : message.status === "sent" ? (
                <Check className="h-3 w-3 text-gray-500" />
              ) : (
                <Clock className="h-3 w-3 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // For others' messages (left side, gray or gradient for AI)
  return (
    <div className="w-full flex justify-start mb-3">
      <div 
        className={`max-w-[80%] px-4 py-3 shadow-sm
          ${isFromAI 
            ? "bg-blue-50 text-gray-800 rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl" 
            : "bg-white border border-gray-200 text-gray-800 rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
          }`}
      >
        {message.subject && (
          <div className="font-medium mb-1 text-gray-700">
            {message.subject}
            {isFromAI && (
              <span className="inline-flex items-center ml-1 text-blue-600">
                <Bot className="h-3 w-3 mr-1" />
                <span className="text-xs font-normal">AI</span>
              </span>
            )}
          </div>
        )}
        
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        <div className="flex items-center justify-start gap-1 mt-1.5">
          <span className="text-xs text-gray-500">
            {formatTimeString(message.sentAt)}
          </span>
        </div>
      </div>
    </div>
  )
} 