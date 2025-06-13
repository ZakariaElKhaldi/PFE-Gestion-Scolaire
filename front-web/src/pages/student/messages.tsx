import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { UserResponse } from "../../types/auth"
import { Message } from "../../types/models"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import { ConversationList } from "../../components/dashboard/messaging/ConversationList"
import { ConversationView } from "../../components/dashboard/messaging/ConversationView"
import { NewMessageDialog } from "../../components/dashboard/messaging/NewMessageDialog"
import { MessageStats } from "../../components/dashboard/messaging/MessageStats"
import { 
  messageService, 
  MessageCounts, 
  ConversationPartner,
  MessageRecipient
} from "../../services/message-service"

interface StudentMessagesProps {
  user: UserResponse
}

export default function StudentMessages({ user }: StudentMessagesProps) {
  // Add a loading state for initial rendering
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
  
  // AI assistant constants
  const AI_ASSISTANT_ID = "ai-assistant-1"
  const isAIConversation = activeConversation === AI_ASSISTANT_ID

  // Initialize and clear loading state
  useEffect(() => {
    // Check if user data is available
    if (user && user.id) {
      // Delay slightly to ensure all data is properly loaded
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Load conversation partners on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (!user || !user.id) {
        console.error("User data missing, cannot load conversations");
        return;
      }
      
      setConversationsLoading(true);
      try {
        const conversations = await messageService.getConversationPartners();
        setConversations(conversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
        // Don't set empty conversations to preserve any existing data
      } finally {
        setConversationsLoading(false);
      }
    };
    
    loadConversations();
  }, [user]);
  
  // Load message stats on mount
  useEffect(() => {
    const loadStats = async () => {
      if (!user || !user.id) {
        console.error("User data missing, cannot load message stats");
        return;
      }
      
      setStatsLoading(true);
      try {
        const stats = await messageService.getMessageCounts();
        setStats(stats);
      } catch (error) {
        console.error("Error loading message stats:", error);
        // Keep default stats in case of error
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadStats();
  }, [user]);
  
  // Load active conversation messages when changed
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      setActiveRecipientDetails(null);
      return;
    }
    
    if (!user || !user.id) {
      console.error("User data missing, cannot load conversation messages");
      return;
    }
    
    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        // Use special method for AI assistant
        const messages = isAIConversation
          ? await messageService.getAIAssistantConversation()
          : await messageService.getConversation(activeConversation);
        
        // Process and set recipient details based on the current conversation
        const conversation = conversations.find(c => c.userId === activeConversation);
        if (conversation) {
          setActiveRecipientDetails({
            name: conversation.name,
            avatar: conversation.avatar
          });
        }
        
        // We don't need to set isMine on messages anymore since ConversationView 
        // will determine this directly from senderId comparison
        setMessages(messages);
        
        // On mobile, switch to conversation view
        setIsMobileViewingConversation(true);
      } catch (error) {
        console.error("Error loading conversation messages:", error);
        // Show an empty conversation rather than crashing
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    };
    
    loadMessages();
    
    // Only depend on activeConversation and user changes
    // NOT including 'conversations' here to avoid continuous refreshes
  }, [activeConversation, user, isAIConversation, conversations]);
  
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
      // Special handling for AI assistant
      if (isAIConversation) {
        // Create user message
        const userMessage: Message = {
          id: `temp-${Date.now()}`,
          senderId: user.id,
          receiverId: AI_ASSISTANT_ID,
          subject: "Message to AI Assistant",
          content: content,
          sentAt: new Date().toISOString(),
          status: "sent"
        }
        
        // Add user message to the conversation
        setMessages(prev => [...prev, userMessage])
        
        // Get AI response
        const aiResponse = await messageService.sendMessageToAI(content)
        
        if (aiResponse) {
          // Add AI response to the conversation
          setMessages(prev => [...prev, aiResponse])
        }
        
        // Update conversation list after sending messages
        // This is outside the message loading effect
        refreshConversations()
        return
      }
      
      // For regular messages
      
      // First add the message to local state for immediate feedback
      const newMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: content,
        sentAt: new Date().toISOString(),
        status: "sent"
      }
      
      // Add to conversation immediately
      setMessages(prev => [...prev, newMessage])
      
      // Then send it to the server
      await messageService.sendMessage({
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: content
      })
      
      // Update conversation list after sending message
      // This is separate from message loading
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
      {isInitialLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium">Loading messages...</h3>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-64px)] bg-white flex flex-col">
          <div className="flex h-full">
            {/* Left sidebar with conversations */}
            <div className={`w-full lg:w-1/3 xl:w-1/4 h-full border-r ${isMobileViewingConversation ? 'hidden lg:block' : 'block'}`}>
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center border-b p-4">
                  <h2 className="text-lg font-semibold">Inbox</h2>
          <button 
            onClick={handleNewMessage}
                    className="p-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                    title="New Message"
          >
                    <Plus className="h-5 w-5" />
          </button>
        </div>

                <div className="flex justify-between p-3 border-b bg-white">
                  <div className="flex space-x-3">
                    <div className="text-center px-3 py-2">
                      <div className="font-semibold text-lg">{stats.total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center px-3 py-2">
                      <div className="font-semibold text-lg text-blue-600">{stats.unread}</div>
                      <div className="text-xs text-gray-500">Unread</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="text-center px-3 py-2">
                      <div className="font-semibold text-lg text-green-600">{stats.sent}</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div className="text-center px-3 py-2">
                      <div className="font-semibold text-lg text-orange-600">{stats.received}</div>
                      <div className="text-xs text-gray-500">Received</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              loading={conversationsLoading}
              onSelectConversation={setActiveConversation}
            />
                </div>
              </div>
          </div>
          
            {/* Main conversation view */}
            <div className={`w-full lg:w-2/3 xl:w-3/4 h-full ${isMobileViewingConversation ? 'block' : 'hidden lg:block'}`}>
            {activeConversation ? (
                <div className="h-full flex flex-col">
              <ConversationView
                messages={messages}
                    currentUserId={user?.id || ''}
                    recipientId={activeConversation || ''}
                    recipientName={activeRecipientDetails?.name || ''}
                recipientAvatar={activeRecipientDetails?.avatar}
                isLoading={messagesLoading}
                onSendMessage={handleSendMessage}
                onBackClick={handleBackToConversations}
              />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
                  <p className="text-gray-500 mb-6">Select a conversation from the list or start a new one.</p>
                <button
                  onClick={handleNewMessage}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    New Message
                </button>
              </div>
            )}
        </div>
      </div>
      
      {/* New Message Dialog */}
          {isNewMessageDialogOpen && (
      <NewMessageDialog
        isOpen={isNewMessageDialogOpen}
        onClose={() => setIsNewMessageDialogOpen(false)}
        recipients={potentialRecipients}
        isLoading={recipientsLoading}
        onSelectRecipient={handleSelectRecipient}
      />
          )}
        </div>
      )}
    </DashboardLayout>
  );
}