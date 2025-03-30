import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { User } from "../../../types/auth"
import { Message } from "../../../types/models"
import { DashboardLayout } from "../../../components/dashboard/layout/dashboard-layout"
import { ConversationList } from "../../../components/dashboard/messaging/ConversationList"
import { ConversationView } from "../../../components/dashboard/messaging/ConversationView"
import { NewMessageDialog } from "../../../components/dashboard/messaging/NewMessageDialog"
import { MessageStats } from "../../../components/dashboard/messaging/MessageStats"
import { 
  messageService, 
  MessageCounts, 
  ConversationPartner,
  MessageRecipient
} from "../../../services/message-service"

interface TeacherMessagesProps {
  user: User
}

export default function TeacherMessages({ user }: TeacherMessagesProps) {
  // State for conversations and active conversation
  const [conversations, setConversations] = useState<ConversationPartner[]>([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  
  // State for messages in the active conversation
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  
  // State for statistics
  const [stats, setStats] = useState<MessageCounts>({
    total: 0,
    sent: 0,
    received: 0,
    unread: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  
  // State for new message dialog
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)
  const [potentialRecipients, setPotentialRecipients] = useState<MessageRecipient[]>([])
  const [recipientsLoading, setRecipientsLoading] = useState(false)
  
  // Active conversation details
  const [activeRecipientDetails, setActiveRecipientDetails] = useState<{
    name: string;
    avatar: string | null;
  } | null>(null)
  
  // Mobile view state
  const [isMobileViewingConversation, setIsMobileViewingConversation] = useState(false)

  // Load conversation partners on mount
  useEffect(() => {
    const loadConversations = async () => {
      setConversationsLoading(true)
      try {
        const conversations = await messageService.getConversationPartners()
        setConversations(conversations)
      } catch (error) {
        console.error("Error loading conversations:", error)
      } finally {
        setConversationsLoading(false)
      }
    }
    
    loadConversations()
  }, [])
  
  // Load message stats on mount
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true)
      try {
        const stats = await messageService.getMessageCounts()
        setStats(stats)
      } catch (error) {
        console.error("Error loading message stats:", error)
      } finally {
        setStatsLoading(false)
      }
    }
    
    loadStats()
  }, [])
  
  // Load active conversation messages when changed
  useEffect(() => {
    if (!activeConversation) {
      setMessages([])
      setActiveRecipientDetails(null)
      return
    }
    
    const loadMessages = async () => {
      setMessagesLoading(true)
      try {
        const messages = await messageService.getConversation(activeConversation)
        
        // Ensure messages have the correct senderId property
        const processedMessages = messages.map(msg => ({
          ...msg,
          // Ensure message ownership is correctly identified
          isMine: msg.senderId === user.id
        }))
        
        setMessages(processedMessages)
        
        // Set recipient details for the header
        const conversation = conversations.find(c => c.userId === activeConversation)
        if (conversation) {
          setActiveRecipientDetails({
            name: conversation.name,
            avatar: conversation.avatar
          })
        }
        
        // On mobile, switch to conversation view
        setIsMobileViewingConversation(true)
        
        // After loading messages, refresh conversation list to update unread counts
        refreshConversations()
      } catch (error) {
        console.error("Error loading conversation messages:", error)
      } finally {
        setMessagesLoading(false)
      }
    }
    
    loadMessages()
  }, [activeConversation, conversations, user.id])
  
  // Function to load potential recipients for new message
  const loadPotentialRecipients = async () => {
    setRecipientsLoading(true)
    try {
      const recipients = await messageService.getPotentialRecipients()
      setPotentialRecipients(recipients)
    } catch (error) {
      console.error("Error loading potential recipients:", error)
    } finally {
      setRecipientsLoading(false)
    }
  }
  
  // Function to refresh conversations list
  const refreshConversations = async () => {
    try {
      const conversations = await messageService.getConversationPartners()
      setConversations(conversations)
      
      // Also refresh stats
      const stats = await messageService.getMessageCounts()
      setStats(stats)
    } catch (error) {
      console.error("Error refreshing conversations:", error)
    }
  }
  
  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!activeConversation || !content.trim()) return
    
    try {
      // Send message via API
      await messageService.sendMessage({
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: content
      })
      
      // Add the sent message to the current messages immediately for better UX
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: content,
        sentAt: new Date().toISOString(),
        status: "sent",
        isMine: true // Explicitly mark as mine
      }
      
      setMessages(prev => [...prev, newMessage])
      
      // Refresh messages
      const messages = await messageService.getConversation(activeConversation)
      
      // Process messages to ensure correct ownership
      const processedMessages = messages.map(msg => ({
        ...msg,
        isMine: msg.senderId === user.id
      }))
      
      setMessages(processedMessages)
      
      // Refresh conversations to update last message
      refreshConversations()
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }
  
  // Handle opening new message dialog
  const handleNewMessage = () => {
    setIsNewMessageDialogOpen(true)
    loadPotentialRecipients()
  }
  
  // Handle selecting a recipient from new message dialog
  const handleSelectRecipient = (recipientId: string) => {
    setActiveConversation(recipientId)
    
    // Find recipient details if exists in potentialRecipients
    const recipient = potentialRecipients.find(r => r.id === recipientId)
    if (recipient) {
      setActiveRecipientDetails({
        name: recipient.fullName,
        avatar: recipient.avatar
      })
    }
  }
  
  // Handle mobile back button
  const handleBackToConversations = () => {
    setIsMobileViewingConversation(false)
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="mt-1 text-sm text-gray-500">
              Communicate with students and staff
            </p>
          </div>
          <button 
            onClick={handleNewMessage}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Message
          </button>
        </div>

        {/* Message Stats */}
        <MessageStats stats={stats} isLoading={statsLoading} />

        {/* Messages Container - Two-column layout */}
        <div className="border rounded-lg shadow-sm bg-white flex h-[calc(100vh-330px)] min-h-[500px] overflow-hidden">
          {/* Conversations List - Hide on mobile when viewing conversation */}
          <div 
            className={`${
              isMobileViewingConversation ? 'hidden lg:block' : 'block'
            } w-full lg:w-1/3 border-r border-gray-200`}
          >
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              loading={conversationsLoading}
              onSelectConversation={setActiveConversation}
              onNewConversation={handleNewMessage}
            />
          </div>
          
          {/* Conversation View - Hide on mobile when not viewing conversation */}
          <div 
            className={`${
              !isMobileViewingConversation ? 'hidden lg:block' : 'block'
            } w-full lg:w-2/3`}
          >
            {activeConversation ? (
              <ConversationView
                messages={messages}
                currentUserId={user.id}
                recipientId={activeConversation}
                recipientName={activeRecipientDetails?.name || "Contact"}
                recipientAvatar={activeRecipientDetails?.avatar}
                isLoading={messagesLoading}
                onSendMessage={handleSendMessage}
                onBackClick={handleBackToConversations}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gray-50">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm">
                  Select a conversation from the list or start a new one to begin messaging.
                </p>
                <button
                  onClick={handleNewMessage}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm transition-colors duration-150"
                >
                  Start a new conversation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* New Message Dialog */}
      <NewMessageDialog
        isOpen={isNewMessageDialogOpen}
        onClose={() => setIsNewMessageDialogOpen(false)}
        recipients={potentialRecipients}
        isLoading={recipientsLoading}
        onSelectRecipient={handleSelectRecipient}
      />
    </DashboardLayout>
  )
}