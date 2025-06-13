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
    <div className="bg-white pb-1 px-1">
      {/* AI suggested questions */}
      {isAI && suggestedQuestions.length > 0 && !message && (
        <div className="mb-2 flex flex-wrap gap-2">
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
      
      <div className="flex items-end rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 bg-white">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2.5 text-gray-500 hover:text-gray-700"
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
            className="w-full resize-none p-3 py-2.5 focus:outline-none border-0 min-h-[40px] max-h-[120px]"
            disabled={disabled}
            rows={1}
          />
        </div>

        {/* Send button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          className={`p-2.5 rounded-lg mx-1 ${
            !message.trim() || disabled
              ? "text-gray-400 cursor-not-allowed"
              : isAI
              ? "text-blue-600 hover:text-blue-700"
              : "text-green-600 hover:text-green-700"
          } transition-colors flex-shrink-0`}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
} 