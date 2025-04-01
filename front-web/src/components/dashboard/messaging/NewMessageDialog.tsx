import { useState, useEffect } from "react"
import { X, Search, User as UserIcon } from "lucide-react"
import { MessageRecipient } from "../../../services/message-service"

interface NewMessageDialogProps {
  isOpen: boolean
  onClose: () => void
  recipients: MessageRecipient[]
  isLoading: boolean
  onSelectRecipient: (recipientId: string) => void
}

export function NewMessageDialog({
  isOpen,
  onClose,
  recipients,
  isLoading,
  onSelectRecipient,
}: NewMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredRecipients, setFilteredRecipients] = useState<MessageRecipient[]>([])

  // Filter recipients based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipients(recipients)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = recipients.filter(
      (recipient) =>
        recipient.fullName.toLowerCase().includes(query) ||
        recipient.role.toLowerCase().includes(query)
    )
    setFilteredRecipients(filtered)
  }, [searchQuery, recipients])

  // Get role badge color based on user role
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "teacher":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      case "parent":
        return "bg-purple-100 text-purple-800"
      case "administrator":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New Message</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for a recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recipients list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "No recipients match your search"
                  : "No recipients available"}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredRecipients.map((recipient) => (
                <li
                  key={recipient.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onSelectRecipient(recipient.id)
                    onClose()
                  }}
                >
                  <div className="flex items-center p-4">
                    {recipient.avatar ? (
                      <img
                        src={recipient.avatar}
                        alt={recipient.fullName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {recipient.fullName}
                      </p>
                      <div className="flex items-center mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                            recipient.role
                          )}`}
                        >
                          {recipient.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
} 