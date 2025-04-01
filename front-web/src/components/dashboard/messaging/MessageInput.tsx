import { useState, useRef, useEffect } from "react"
import { Send, Smile, Paperclip, Bot } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
  isAI?: boolean
}

export function MessageInput({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false,
  isAI = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])

  // AI-specific suggested questions
  useEffect(() => {
    if (isAI) {
      setSuggestedQuestions([
        "What assignments are due this week?",
        "Can you explain how to submit an assignment?",
        "What resources are available for studying?",
        "What are the school's attendance policies?",
      ])
    }
  }, [isAI])

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px" // Reset height
      textareaRef.current.style.height = `${Math.min(
        100,
        textareaRef.current.scrollHeight
      )}px`
    }
  }, [message])

  const handleSendMessage = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "40px"
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const selectSuggestedQuestion = (question: string) => {
    setMessage(question)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* AI suggested questions */}
      {isAI && suggestedQuestions.length > 0 && !message && (
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => selectSuggestedQuestion(question)}
              className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center"
            >
              <Bot className="h-3 w-3 mr-1" />
              {question}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Message textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isAI ? "Ask the AI Assistant a question..." : placeholder}
            className="w-full resize-none rounded-lg border border-gray-300 p-3 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-[120px]"
            disabled={disabled}
            rows={1}
          />
          <button
            type="button"
            className="absolute right-2 bottom-2 p-1 text-gray-500 rounded-full hover:bg-gray-100"
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          className={`p-3 rounded-full ${
            !message.trim() || disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : isAI
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-green-600 text-white hover:bg-green-700"
          } transition-colors flex-shrink-0`}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
} 