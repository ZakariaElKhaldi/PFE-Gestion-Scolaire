import { useState } from "react"
import { Search, User as UserIcon, Check, CheckCheck, Clock, MessageSquare, PlusCircle } from "lucide-react"
import { ConversationPartner } from "../../../services/message-service"
import { formatDistanceToNow } from "date-fns"

interface ConversationListProps {
  conversations: ConversationPartner[]
  activeConversation: string | null
  loading: boolean
  onSelectConversation: (userId: string) => void
  onSearchChange?: (search: string) => void
  onNewConversation?: () => void
}

export function ConversationList({
  conversations,
  activeConversation,
  loading,
  onSelectConversation,
  onSearchChange,
  onNewConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (onSearchChange) {
      onSearchChange(query)
    }
  }

  // Function to get status icon based on message status
  const getStatusIcon = (status: string, isFromMe: boolean) => {
    if (!isFromMe) return null
    if (status === "sent") return <Check className="h-4 w-4 text-gray-400" />
    if (status === "delivered") return <CheckCheck className="h-4 w-4 text-gray-400" />
    if (status === "read") return <CheckCheck className="h-4 w-4 text-blue-500" />
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  // Function to format time for display
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return "Recently"
    }
  }

  // Function to truncate message content
  const truncateMessage = (content: string, maxLength = 40) => {
    if (content.length <= maxLength) return content
    return `${content.substring(0, maxLength)}...`
  }

  return (
    <div className="h-full flex flex-col border-r border-gray-200">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="rounded-full bg-green-50 p-4 mb-4">
              <MessageSquare className="h-7 w-7 text-green-500" />
            </div>
            <h3 className="font-medium text-gray-900">No conversations yet</h3>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              Start a new conversation to chat with your contacts
            </p>
            {onNewConversation && (
              <button
                onClick={onNewConversation}
                className="mt-4 flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                <PlusCircle className="h-4 w-4" />
                New Conversation
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li
                key={conversation.userId}
                className={`hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                  activeConversation === conversation.userId
                    ? "bg-blue-50 hover:bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => onSelectConversation(conversation.userId)}
              >
                <div className="flex items-center p-3">
                  <div className="relative flex-shrink-0">
                    {conversation.avatar ? (
                      <img
                        src={conversation.avatar}
                        alt={conversation.name}
                        className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center shadow-sm">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${conversation.unreadCount > 0 ? "text-gray-900 font-semibold" : "text-gray-700"} truncate`}>
                        {conversation.name}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? "text-gray-800" : "text-gray-500"}`}>
                        {truncateMessage(conversation.lastMessage)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 