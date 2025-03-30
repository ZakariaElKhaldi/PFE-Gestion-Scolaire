import { apiClient } from "../lib/api-client"
import { Message } from "../types/models"
import { formatISO, subDays, subHours, subMinutes } from "date-fns"
import { AiProfileService } from "./ai-profile.service"

export interface CreateMessageData {
  receiverId: string
  subject: string
  content: string
}

export interface MessageFilters {
  status?: Message["status"]
  search?: string
  startDate?: string
  endDate?: string
}

export interface MessageCounts {
  total: number
  sent: number
  received: number
  unread: number
}

export interface ConversationPartner {
  userId: string
  name: string
  avatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export interface MessageRecipient {
  id: string
  fullName: string
  avatar: string | null
  role: string
}

export class MessageService {
  private basePath = "/messages"
  
  // Mock data for development
  private mockMessages: Message[] = []
  private mockPartners: ConversationPartner[] = []
  private mockRecipients: MessageRecipient[] = []
  private readonly AI_ASSISTANT_ID = "ai-assistant-1"

  constructor() {
    // Initialize mock data
    this.initMockMessages();
    this.initMockPartners();
    this.initMockRecipients();
  }

  async getMessages(filters?: MessageFilters) {
    try {
      // Convert filters to a compatible format for URL parameters
      const queryParams: Record<string, string> = {};
      if (filters?.status) queryParams.status = filters.status;
      if (filters?.search) queryParams.search = filters.search;
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;

      const response = await apiClient.get(this.basePath, Object.keys(queryParams).length ? queryParams : undefined)
      const data = response.data as { messages: Message[] }
      return data.messages || []
    } catch (error) {
      console.error("Error fetching messages:", error)
      // Return filtered mock messages as fallback
      return this.filterMockMessages(filters)
    }
  }

  async getMessage(id: string) {
    try {
      const response = await apiClient.get(`${this.basePath}/${id}`)
      const data = response.data as { message: Message }
      return data.message
    } catch (error) {
      console.error(`Error fetching message ${id}:`, error)
      // Return mock message as fallback
      return this.mockMessages.find(msg => msg.id === id) || null
    }
  }

  async sendMessage(messageData: CreateMessageData) {
    try {
      const response = await apiClient.post(this.basePath, messageData)
      const data = response.data as { message: Message }
      return data.message
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Create mock message as fallback
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: "teacher-1", // Assuming current user is the teacher
        receiverId: messageData.receiverId,
        subject: messageData.subject,
        content: messageData.content,
        sentAt: formatISO(new Date()),
        status: "sent",
        isMine: true
      }
      
      // Add to mock data
      this.mockMessages.unshift(newMessage)
      
      // Update mock partners or create new conversation
      const existingPartner = this.mockPartners.find(p => p.userId === messageData.receiverId)
      const recipient = this.mockRecipients.find(r => r.id === messageData.receiverId)
      
      if (existingPartner) {
        existingPartner.lastMessage = messageData.content
        existingPartner.lastMessageTime = newMessage.sentAt
      } else if (recipient) {
        this.mockPartners.unshift({
          userId: recipient.id,
          name: recipient.fullName,
          avatar: recipient.avatar,
          lastMessage: messageData.content,
          lastMessageTime: newMessage.sentAt,
          unreadCount: 0
        })
      }
      
      return newMessage
    }
  }

  async deleteMessage(id: string) {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      return true
    } catch (error) {
      console.error(`Error deleting message ${id}:`, error)
      
      // Remove from mock data as fallback
      this.mockMessages = this.mockMessages.filter(msg => msg.id !== id)
      return true
    }
  }

  async markAsRead(id: string) {
    try {
      const response = await apiClient.patch(`${this.basePath}/${id}/read`, {})
      const data = response.data as { message: Message }
      return data.message
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error)
      
      // Update mock message as fallback
      const message = this.mockMessages.find(msg => msg.id === id)
      if (message && message.status !== "read") {
        message.status = "read"
        message.readAt = formatISO(new Date())
        
        // Update unread count in conversation
        const partner = this.mockPartners.find(p => p.userId === message.senderId)
        if (partner && partner.unreadCount > 0) {
          partner.unreadCount--
        }
      }
      return message || null
    }
  }

  async getInbox(filters?: MessageFilters) {
    try {
      // Convert filters to a compatible format for URL parameters
      const queryParams: Record<string, string> = {};
      if (filters?.status) queryParams.status = filters.status;
      if (filters?.search) queryParams.search = filters.search;
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;

      const response = await apiClient.get(`${this.basePath}/inbox`, Object.keys(queryParams).length ? queryParams : undefined)
      const data = response.data as { messages: Message[] }
      return data.messages || []
    } catch (error) {
      console.error("Error fetching inbox:", error)
      
      // Return filtered mock messages as fallback
      return this.mockMessages
        .filter(msg => msg.receiverId === "teacher-1")
        .filter(msg => this.applyFilters(msg, filters))
    }
  }

  async getSent(filters?: MessageFilters) {
    try {
      // Convert filters to a compatible format for URL parameters
      const queryParams: Record<string, string> = {};
      if (filters?.status) queryParams.status = filters.status;
      if (filters?.search) queryParams.search = filters.search;
      if (filters?.startDate) queryParams.startDate = filters.startDate;
      if (filters?.endDate) queryParams.endDate = filters.endDate;

      const response = await apiClient.get(`${this.basePath}/sent`, Object.keys(queryParams).length ? queryParams : undefined)
      const data = response.data as { messages: Message[] }
      return data.messages || []
    } catch (error) {
      console.error("Error fetching sent messages:", error)
      
      // Return filtered mock messages as fallback
      return this.mockMessages
        .filter(msg => msg.senderId === "teacher-1")
        .filter(msg => this.applyFilters(msg, filters))
    }
  }

  async getUnread() {
    try {
      const response = await apiClient.get(`${this.basePath}/unread`)
      const data = response.data as { messages: Message[] }
      return data.messages || []
    } catch (error) {
      console.error("Error fetching unread messages:", error)
      
      // Return mock unread messages as fallback
      return this.mockMessages
        .filter(msg => msg.receiverId === "teacher-1" && msg.status !== "read")
    }
  }

  async getConversation(userId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<Message[] | { messages: Message[], count: number }>(`${this.basePath}/conversation/${userId}`);
      
      let messages: Message[] = [];
      
      // Handle different response formats
      if (response.data) {
        if (Array.isArray(response.data)) {
          // New format - API returns messages array directly
          messages = response.data;
        } else if (response.data.messages && Array.isArray(response.data.messages)) {
          // Old format - API returns { messages, count }
          messages = response.data.messages;
        }
      }
      
      if (messages.length > 0) {
        // Process messages to ensure they have the correct properties
        const currentUserId = this.getCurrentUserId();
        return messages.map(message => ({
          ...message,
          isMine: message.senderId === currentUserId
        }));
      }
      
      return this.getMockConversation(userId);
    } catch (error) {
      console.warn("Error fetching conversation:", error);
      return this.getMockConversation(userId);
    }
  }
  
  async getConversationPartners() {
    try {
      const response = await apiClient.get(`${this.basePath}/partners`)
      // Better error handling - handle different response structures
      if (response && response.data) {
        // Handle both formats: {partners: [...]} or {data: {partners: [...]}}
        if (Array.isArray(response.data)) {
          return response.data as ConversationPartner[];
        } else {
          const data = response.data as any;
          if (data.partners && Array.isArray(data.partners)) {
            return data.partners as ConversationPartner[];
          } else if (data.data && data.data.partners && Array.isArray(data.data.partners)) {
            return data.data.partners as ConversationPartner[];
          }
        }
      }
      
      // If we couldn't extract partners from response, use mock data
      console.warn("Response format unexpected, using mock data:", response?.data);
      
      // Return mock partners as fallback
      // Add AI Assistant to the top of the list if it's not there
      const partners = [...this.mockPartners]
      if (!partners.some(p => p.userId === this.AI_ASSISTANT_ID)) {
        partners.unshift(this.getAIAssistantProfile())
      }
      return partners
    } catch (error) {
      console.error("Error fetching conversation partners:", error)
      
      // Return mock partners as fallback
      // Add AI Assistant to the top of the list if it's not there
      const partners = [...this.mockPartners]
      if (!partners.some(p => p.userId === this.AI_ASSISTANT_ID)) {
        partners.unshift(this.getAIAssistantProfile())
      }
      return partners
    }
  }
  
  async getPotentialRecipients() {
    try {
      const response = await apiClient.get(`${this.basePath}/recipients`)
      const data = response.data as { recipients: MessageRecipient[] }
      return data.recipients || []
    } catch (error) {
      console.error("Error fetching potential recipients:", error)
      
      // Return mock recipients as fallback
      // Add AI Assistant to the top of the list if it's not there
      const recipients = [...this.mockRecipients]
      if (!recipients.some(r => r.id === this.AI_ASSISTANT_ID)) {
        recipients.unshift(this.getAIAssistantRecipient())
      }
      return recipients
    }
  }
  
  async getMessageCounts(): Promise<MessageCounts> {
    try {
      const response = await apiClient.get(`${this.basePath}/counts`)
      const data = response.data as MessageCounts
      return data || { total: 0, sent: 0, received: 0, unread: 0 }
    } catch (error) {
      console.error("Error fetching message counts:", error)
      
      // Calculate mock counts as fallback
      const total = this.mockMessages.length
      const sent = this.mockMessages.filter(msg => msg.senderId === "teacher-1").length
      const received = this.mockMessages.filter(msg => msg.receiverId === "teacher-1").length
      const unread = this.mockMessages.filter(msg => 
        msg.receiverId === "teacher-1" && msg.status !== "read"
      ).length
      
      return { total, sent, received, unread }
    }
  }
  
  // Helper methods for mock data
  private filterMockMessages(filters?: MessageFilters) {
    if (!filters) return this.mockMessages
    
    return this.mockMessages.filter(msg => this.applyFilters(msg, filters))
  }
  
  private applyFilters(message: Message, filters?: MessageFilters) {
    if (!filters) return true
    
    // Status filter
    if (filters.status && message.status !== filters.status) {
      return false
    }
    
    // Date range filter
    if (filters.startDate && new Date(message.sentAt) < new Date(filters.startDate)) {
      return false
    }
    
    if (filters.endDate && new Date(message.sentAt) > new Date(filters.endDate)) {
      return false
    }
    
    // Search filter - search in subject and content
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSubject = message.subject.toLowerCase().includes(searchLower)
      const matchesContent = message.content.toLowerCase().includes(searchLower)
      
      if (!matchesSubject && !matchesContent) {
        return false
      }
    }
    
    return true
  }

  private getCurrentUserId(): string {
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        return user.id;
      }
    } catch (e) {
      console.error("Error getting current user ID:", e);
    }
    
    // Fallback to 'teacher-1' for mock data if no user is found
    return 'teacher-1';
  }

  private getMockConversation(userId: string): Message[] {
    // For AI Assistant, create a special welcome message if no conversation exists
    if (userId === this.AI_ASSISTANT_ID) {
      const currentUserId = this.getCurrentUserId();
      
      // Get existing conversation or create new one
      let conversation = this.mockMessages.filter(message => 
        (message.senderId === userId && message.receiverId === currentUserId) ||
        (message.senderId === currentUserId && message.receiverId === userId)
      );
      
      // If no conversation exists, add a welcome message
      if (conversation.length === 0) {
        const welcomeMessage: Message = {
          id: `msg-ai-welcome`,
          senderId: this.AI_ASSISTANT_ID,
          receiverId: currentUserId,
          subject: "Welcome",
          content: "Hello! I'm your AI Assistant. How can I help you today? You can ask me questions about your courses, assignments, or school policies.",
          sentAt: formatISO(new Date()),
          status: "sent",
          isMine: false
        };
        
        this.mockMessages.push(welcomeMessage);
        conversation = [welcomeMessage];
        
        // Also create a conversation partner entry if it doesn't exist
        if (!this.mockPartners.some(p => p.userId === this.AI_ASSISTANT_ID)) {
          this.mockPartners.unshift(this.getAIAssistantProfile());
        }
      }
      
      return conversation;
    }
    
    // For regular users, use the existing method
    const currentUserId = this.getCurrentUserId();
    const conversationMessages = this.mockMessages.filter(message => 
      (message.senderId === userId && message.receiverId === currentUserId) ||
      (message.senderId === currentUserId && message.receiverId === userId)
    );
    
    return conversationMessages.map(message => ({
      ...message,
      isMine: message.senderId === currentUserId
    }));
  }

  // Get AI Assistant profile for conversation list
  private getAIAssistantProfile(): ConversationPartner {
    return {
      userId: this.AI_ASSISTANT_ID,
      name: "AI Assistant",
      avatar: null,
      lastMessage: "Hello! I'm your AI Assistant. How can I help you today?",
      lastMessageTime: formatISO(new Date()),
      unreadCount: 1
    };
  }

  // Get AI Assistant as a potential recipient
  private getAIAssistantRecipient(): MessageRecipient {
    return {
      id: this.AI_ASSISTANT_ID,
      fullName: "AI Assistant",
      avatar: null,
      role: "assistant"
    };
  }

  // Get a conversation with the AI Assistant
  async getAIAssistantConversation(): Promise<Message[]> {
    try {
      const conversation = this.getMockConversation(this.AI_ASSISTANT_ID);
      return conversation;
    } catch (error) {
      console.error("Error getting AI assistant conversation:", error);
      return [];
    }
  }

  // Send a message to the AI Assistant
  async sendMessageToAI(content: string): Promise<Message | null> {
    try {
      // First add the user message to the conversation
      const userMessage: Message = {
        id: `msg-ai-${Date.now()}-user`,
        senderId: this.getCurrentUserId(),
        receiverId: this.AI_ASSISTANT_ID,
        subject: "Message to AI Assistant",
        content: content,
        sentAt: formatISO(new Date()),
        status: "sent",
        isMine: true
      };
      
      // Add to mock data
      this.mockMessages.push(userMessage);
      
      // Update the last message in the AI conversation partner
      const aiPartner = this.mockPartners.find(p => p.userId === this.AI_ASSISTANT_ID);
      if (aiPartner) {
        aiPartner.lastMessage = content;
        aiPartner.lastMessageTime = userMessage.sentAt;
      }
      
      // Now get AI response using the AI Profile service
      try {
        const aiResponse = await AiProfileService.queryProfile(content);
        
        // Create AI response message
        const aiResponseMessage: Message = {
          id: `msg-ai-${Date.now()}-response`,
          senderId: this.AI_ASSISTANT_ID,
          receiverId: this.getCurrentUserId(),
          subject: "Re: Message to AI Assistant",
          content: aiResponse.response || "I'm sorry, I couldn't process your message.",
          sentAt: formatISO(new Date()),
          status: "sent",
          isMine: false
        };
        
        // Add to mock data
        this.mockMessages.push(aiResponseMessage);
        
        // Update the last message in the AI conversation partner
        if (aiPartner) {
          aiPartner.lastMessage = aiResponseMessage.content;
          aiPartner.lastMessageTime = aiResponseMessage.sentAt;
          aiPartner.unreadCount += 1;
        }
        
        return aiResponseMessage;
      } catch (error) {
        console.error("Error getting AI response:", error);
        
        // Create fallback AI error message
        const aiErrorMessage: Message = {
          id: `msg-ai-${Date.now()}-error`,
          senderId: this.AI_ASSISTANT_ID,
          receiverId: this.getCurrentUserId(),
          subject: "Re: Message to AI Assistant",
          content: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
          sentAt: formatISO(new Date()),
          status: "sent",
          isMine: false
        };
        
        // Add to mock data
        this.mockMessages.push(aiErrorMessage);
        
        // Update the last message in the AI conversation partner
        if (aiPartner) {
          aiPartner.lastMessage = aiErrorMessage.content;
          aiPartner.lastMessageTime = aiErrorMessage.sentAt;
          aiPartner.unreadCount += 1;
        }
        
        return aiErrorMessage;
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      return null;
    }
  }

  // Initialize mock messages with proper sender identification
  private initMockMessages() {
    const currentUserId = 'teacher-1'; // Always use teacher-1 as the current user for mock data
    
    // Ensure all messages have the isMine property set correctly
    this.mockMessages = [
      {
        id: "msg-1",
        senderId: currentUserId, // This is a message from the current user (teacher)
        receiverId: "student-1",
        subject: "Homework Assignment",
        content: "Please remember to submit your homework by Friday.",
        sentAt: "2023-06-01T10:30:00Z",
        status: "read",
        isMine: true // Explicitly mark as the current user's message
      },
      {
        id: "msg-2",
        senderId: "student-1", // This is a message from a student
        receiverId: currentUserId,
        subject: "Re: Homework Assignment",
        content: "Thank you for the reminder. I'll submit it on time.",
        sentAt: "2023-06-01T11:15:00Z",
        status: "read",
        isMine: false // Not the current user's message
      },
      // Add more mock messages as needed
      {
        id: "msg-3",
        senderId: currentUserId,
        receiverId: "student-2",
        subject: "Project Feedback",
        content: "Great work on your recent project! I've added some comments for improvement.",
        sentAt: "2023-06-02T09:00:00Z",
        status: "delivered",
        isMine: true
      },
      {
        id: "msg-4",
        senderId: "student-2",
        receiverId: currentUserId,
        subject: "Re: Project Feedback",
        content: "Thank you for the feedback! I'll work on those areas for the next submission.",
        sentAt: "2023-06-02T10:30:00Z",
        status: "read",
        isMine: false
      },
      {
        id: "msg-5",
        senderId: "principal-1",
        receiverId: currentUserId,
        subject: "Staff Meeting",
        content: "This is a reminder that we have a staff meeting scheduled for Friday at 2 PM.",
        sentAt: "2023-06-03T08:45:00Z",
        status: "read",
        isMine: false
      },
      {
        id: "msg-6",
        senderId: currentUserId,
        receiverId: "principal-1",
        subject: "Re: Staff Meeting",
        content: "Thank you for the reminder. I'll be there.",
        sentAt: "2023-06-03T09:15:00Z",
        status: "read",
        isMine: true
      }
    ];
  }

  // Initialize mock partners based on messages
  private initMockPartners() {
    const currentUserId = 'teacher-1';
    
    // Extract unique conversation partners from messages
    const partnerIds = new Set<string>();
    
    this.mockMessages.forEach(msg => {
      if (msg.senderId !== currentUserId) {
        partnerIds.add(msg.senderId);
      }
      if (msg.receiverId !== currentUserId) {
        partnerIds.add(msg.receiverId);
      }
    });
    
    // Create conversation partners
    this.mockPartners = Array.from(partnerIds).map(id => {
      // Find the last message with this partner
      const messagesWithPartner = this.mockMessages.filter(msg => 
        (msg.senderId === id && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === id)
      ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      
      const lastMessage = messagesWithPartner[0];
      const unreadCount = messagesWithPartner.filter(msg => 
        msg.senderId === id && !msg.readAt
      ).length;
      
      return {
        userId: id,
        name: this.getPartnerName(id),
        avatar: null,
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.sentAt || new Date().toISOString(),
        unreadCount
      };
    });
  }
  
  // Get partner name based on ID
  private getPartnerName(id: string): string {
    if (id === 'student-1') return 'Alex Johnson';
    if (id === 'student-2') return 'Maria Garcia';
    if (id === 'principal-1') return 'Principal Williams';
    if (id.startsWith('student-')) return `Student ${id.split('-')[1]}`;
    if (id.startsWith('teacher-')) return `Teacher ${id.split('-')[1]}`;
    if (id.startsWith('admin-')) return `Admin ${id.split('-')[1]}`;
    return id;
  }
  
  // Initialize mock recipients
  private initMockRecipients() {
    this.mockRecipients = [
      // Add AI Assistant as the first recipient
      this.getAIAssistantRecipient(),
      {
        id: "student-1",
        fullName: "Alex Johnson",
        avatar: null,
        role: "student",
      },
      {
        id: "student-2",
        fullName: "Maria Garcia",
        avatar: null,
        role: "student",
      },
      {
        id: "student-3",
        fullName: "John Smith",
        avatar: null,
        role: "student",
      },
      {
        id: "principal-1",
        fullName: "Principal Williams",
        avatar: null,
        role: "admin",
      },
      {
        id: "teacher-2",
        fullName: "Ms. Martinez",
        avatar: null,
        role: "teacher",
      },
    ];
  }
}

export const messageService = new MessageService() 