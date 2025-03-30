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
      <div className="w-full flex justify-end mb-2">
        <div className="max-w-[80%] bg-blue-600 text-white px-4 py-2 rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl shadow-sm">
          {message.subject && (
            <div className="font-medium mb-1">
              {message.subject}
            </div>
          )}
          
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-xs text-blue-200">
              {formatTimeString(message.sentAt)}
            </span>
            <div className="ml-1">
              {message.status === "read" ? (
                <CheckCircle className="h-3 w-3 text-blue-300" />
              ) : (
                <span className="inline-block h-2 w-2 rounded-full border border-blue-200"></span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // For others' messages (left side, gray or gradient for AI)
  return (
    <div className="w-full flex justify-start mb-2">
      <div 
        className={`max-w-[80%] px-4 py-2 rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm
          ${isFromAI 
            ? "bg-gradient-to-br from-violet-100 to-blue-100 text-gray-800" 
            : "bg-gray-100 text-gray-800"
          }`}
      >
        {message.subject && (
          <div className="font-medium mb-1 text-gray-700">
            {message.subject}
            {isFromAI && (
              <span className="inline-flex items-center ml-1 text-blue-600">
                <Bot className="h-3 w-3 mr-1" />
              </span>
            )}
          </div>
        )}
        
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        <div className="flex items-center justify-start gap-1 mt-1">
          <span className="text-xs text-gray-500">
            {formatTimeString(message.sentAt)}
          </span>
        </div>
      </div>
    </div>
  )
} 