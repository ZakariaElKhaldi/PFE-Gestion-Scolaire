import { useState, useRef, useEffect } from "react"
import { Send, Smile, Paperclip } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export function MessageInput({
  onSendMessage,
  placeholder = "Type a message",
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px" // Reset height
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight <= 120 
        ? `${scrollHeight}px` 
        : "120px" // Max height
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 border-t border-gray-200 bg-white"
    >
      <div className="flex items-end gap-2">
        <div className="relative flex-1 flex items-center bg-gray-50 rounded-full border border-gray-300 px-3 py-1">
          {/* Emoji button - placeholder for now */}
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </button>
          
          {/* Text input area */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full ml-2 mr-2 py-2 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400 overflow-auto"
            style={{ maxHeight: "120px" }}
          />
          
          {/* Attachment button - placeholder for now */}
          <button
            type="button"
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none mr-1"
            disabled={disabled}
          >
            <Paperclip className="h-5 w-5" />
          </button>
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`rounded-full p-3 focus:outline-none ${
            !message.trim() || disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  )
} 