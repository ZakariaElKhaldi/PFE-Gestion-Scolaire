import { apiClient } from "../utils/api-client";
import { Message } from "../types/models";
import { formatISO } from "date-fns";
import { aiProfileService } from "./ai-profile";

export interface CreateMessageData {
  receiverId: string;
  subject: string;
  content: string;
}

export interface MessageCounts {
  total: number;
  sent: number;
  received: number;
  unread: number;
}

export interface ConversationPartner {
  userId: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface MessageRecipient {
  id: string;
  fullName: string;
  avatar: string | null;
  role: string;
}

class MessageServiceClass {
  private basePath = "/messages";
  private readonly AI_ASSISTANT_ID = "ai-assistant-1";
  
  // Mock data for development
  private mockMessages: Message[] = [];
  private mockPartners: ConversationPartner[] = [];
  private mockRecipients: MessageRecipient[] = [];

  constructor() {
    // Initialize mock data
    this.initMockMessages();
    this.initMockPartners();
    this.initMockRecipients();
  }

  async getConversation(userId: string): Promise<Message[]> {
    // If this is a conversation with the AI assistant, use special handling
    if (userId === this.AI_ASSISTANT_ID) {
      return this.getAIAssistantConversation();
    }

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
      
      // Process messages to ensure they have the correct properties
      const currentUserId = this.getCurrentUserId();
      messages = messages.map(message => ({
        ...message,
        isMine: message.senderId === currentUserId
      }));
      
      return messages.sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
    } catch (error) {
      console.error(`Error fetching conversation with ${userId}:`, error);
      
      // Return mock conversation as fallback
      return this.getMockConversation(userId);
    }
  }

  async getConversationPartners(): Promise<ConversationPartner[]> {
    try {
      const response = await apiClient.get<ConversationPartner[]>(`${this.basePath}/partners`);
      
      // Add AI assistant to conversation partners
      const partners = response.data || [];
      const aiAssistant = this.getAIAssistantProfile();
      
      // Check if AI assistant already exists in the list
      if (!partners.find(p => p.userId === this.AI_ASSISTANT_ID)) {
        partners.push(aiAssistant);
      }
      
      return partners;
    } catch (error) {
      console.error("Error fetching conversation partners:", error);
      
      // Return mock partners as fallback
      const mockPartners = [...this.mockPartners];
      const aiAssistant = this.getAIAssistantProfile();
      
      // Add AI assistant if not already in the list
      if (!mockPartners.find(p => p.userId === this.AI_ASSISTANT_ID)) {
        mockPartners.push(aiAssistant);
      }
      
      return mockPartners;
    }
  }

  async getPotentialRecipients(): Promise<MessageRecipient[]> {
    try {
      const response = await apiClient.get<MessageRecipient[]>(`${this.basePath}/recipients`);
      
      // Add AI assistant to the list of recipients
      const recipients = response.data || [];
      const aiAssistant = this.getAIAssistantRecipient();
      
      // Check if AI assistant already exists in the list
      if (!recipients.find(r => r.id === this.AI_ASSISTANT_ID)) {
        recipients.push(aiAssistant);
      }
      
      return recipients;
    } catch (error) {
      console.error("Error fetching potential recipients:", error);
      
      // Return mock recipients as fallback
      const mockRecipients = [...this.mockRecipients];
      const aiAssistant = this.getAIAssistantRecipient();
      
      // Add AI assistant if not already in the list
      if (!mockRecipients.find(r => r.id === this.AI_ASSISTANT_ID)) {
        mockRecipients.push(aiAssistant);
      }
      
      return mockRecipients;
    }
  }

  async getMessageCounts(): Promise<MessageCounts> {
    try {
      const response = await apiClient.get<MessageCounts>(`${this.basePath}/counts`);
      return response.data || { total: 0, sent: 0, received: 0, unread: 0 };
    } catch (error) {
      console.error("Error fetching message counts:", error);
      
      // Calculate mock counts as fallback
      const currentUserId = this.getCurrentUserId();
      
      const sent = this.mockMessages.filter(msg => msg.senderId === currentUserId).length;
      const received = this.mockMessages.filter(msg => msg.receiverId === currentUserId).length;
      const unread = this.mockMessages.filter(msg => 
        msg.receiverId === currentUserId && msg.status !== "read"
      ).length;
      
      return {
        total: sent + received,
        sent,
        received,
        unread
      };
    }
  }

  async sendMessage(messageData: CreateMessageData): Promise<Message> {
    // Handle sending to AI assistant differently
    if (messageData.receiverId === this.AI_ASSISTANT_ID) {
      const aiMessage = await this.sendMessageToAI(messageData.content);
      if (aiMessage) return aiMessage;
    }

    try {
      const response = await apiClient.post<{ message: Message }>(this.basePath, messageData);
      
      // Process message to ensure it has the correct properties
      const message = {
        ...response.data.message,
        isMine: true
      };
      
      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Create mock message as fallback
      const currentUserId = this.getCurrentUserId();
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUserId,
        receiverId: messageData.receiverId,
        subject: messageData.subject,
        content: messageData.content,
        sentAt: formatISO(new Date()),
        status: "sent",
        isMine: true
      };
      
      // Add to mock data
      this.mockMessages.push(newMessage);
      
      // Update mock partners or create new conversation
      const existingPartner = this.mockPartners.find(p => p.userId === messageData.receiverId);
      const recipient = this.mockRecipients.find(r => r.id === messageData.receiverId);
      
      if (existingPartner) {
        existingPartner.lastMessage = messageData.content;
        existingPartner.lastMessageTime = newMessage.sentAt;
      } else if (recipient) {
        this.mockPartners.unshift({
          userId: recipient.id,
          name: recipient.fullName,
          avatar: recipient.avatar,
          lastMessage: messageData.content,
          lastMessageTime: newMessage.sentAt,
          unreadCount: 0
        });
      }
      
      return newMessage;
    }
  }

  async markAsRead(id: string): Promise<Message | null> {
    try {
      const response = await apiClient.patch<{ message: Message }>(`${this.basePath}/${id}/read`, {});
      
      // Process message to ensure it has the correct properties
      const message = {
        ...response.data.message,
        isMine: response.data.message.senderId === this.getCurrentUserId()
      };
      
      return message;
    } catch (error) {
      console.error(`Error marking message ${id} as read:`, error);
      
      // Update mock message as fallback
      const message = this.mockMessages.find(msg => msg.id === id);
      if (message && message.status !== "read") {
        message.status = "read";
        message.readAt = formatISO(new Date());
        
        // Update unread count in conversation
        const partner = this.mockPartners.find(p => p.userId === message.senderId);
        if (partner && partner.unreadCount > 0) {
          partner.unreadCount--;
        }
      }
      return message || null;
    }
  }

  // AI Assistant methods
  private getAIAssistantProfile(): ConversationPartner {
    return {
      userId: this.AI_ASSISTANT_ID,
      name: "AI Assistant",
      avatar: null, // You could use a specific AI avatar image URL here
      lastMessage: "How can I help you today?",
      lastMessageTime: formatISO(new Date()),
      unreadCount: 0
    };
  }

  private getAIAssistantRecipient(): MessageRecipient {
    return {
      id: this.AI_ASSISTANT_ID,
      fullName: "AI Assistant",
      avatar: null,
      role: "assistant"
    };
  }

  async getAIAssistantConversation(): Promise<Message[]> {
    // Try to get from mock data first
    const conversation = this.getMockConversation(this.AI_ASSISTANT_ID);
    
    // If no existing conversation, create a welcome message
    if (conversation.length === 0) {
      const welcomeMessage: Message = {
        id: `ai-welcome-${Date.now()}`,
        senderId: this.AI_ASSISTANT_ID,
        receiverId: this.getCurrentUserId(),
        subject: "Welcome",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        sentAt: formatISO(new Date()),
        status: "delivered",
        isMine: false
      };
      
      this.mockMessages.push(welcomeMessage);
      return [welcomeMessage];
    }
    
    return conversation;
  }

  async sendMessageToAI(content: string): Promise<Message | null> {
    try {
      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: this.getCurrentUserId(),
        receiverId: this.AI_ASSISTANT_ID,
        subject: "Message to AI",
        content: content,
        sentAt: formatISO(new Date()),
        status: "sent",
        isMine: true
      };
      
      // Add user message to mock data
      this.mockMessages.push(userMessage);
      
      // Get conversation history to provide context
      const conversation = this.getMockConversation(this.AI_ASSISTANT_ID);
      const conversationContext = conversation
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.senderId === this.AI_ASSISTANT_ID ? 'AI:' : 'User:'} ${msg.content}`)
        .join('\n');
      
      // Get AI response
      const aiResponse = await aiProfileService.queryProfile(content, conversationContext);
      
      // Create AI response message
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        senderId: this.AI_ASSISTANT_ID,
        receiverId: this.getCurrentUserId(),
        subject: "AI Response",
        content: aiResponse.response,
        sentAt: formatISO(new Date()),
        status: "delivered",
        isMine: false
      };
      
      // Add AI message to mock data
      this.mockMessages.push(aiMessage);
      
      // Update conversation partner
      const aiPartner = this.mockPartners.find(p => p.userId === this.AI_ASSISTANT_ID);
      if (aiPartner) {
        aiPartner.lastMessage = aiResponse.response;
        aiPartner.lastMessageTime = aiMessage.sentAt;
      } else {
        this.mockPartners.push({
          ...this.getAIAssistantProfile(),
          lastMessage: aiResponse.response,
          lastMessageTime: aiMessage.sentAt
        });
      }
      
      return aiMessage;
    } catch (error) {
      console.error("Error sending message to AI:", error);
      
      // Create fallback AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        senderId: this.AI_ASSISTANT_ID,
        receiverId: this.getCurrentUserId(),
        subject: "AI Response",
        content: "I'm sorry, I couldn't process your message right now. Please try again later.",
        sentAt: formatISO(new Date()),
        status: "delivered",
        isMine: false
      };
      
      // Add fallback message to mock data
      this.mockMessages.push(aiMessage);
      
      return aiMessage;
    }
  }

  async getAISuggestions(context: string): Promise<{ suggestions: string[] }> {
    try {
      // Get AI suggestions using the aiProfileService
      const response = await aiProfileService.generateResponseSuggestions(context);
      return { suggestions: response || [] };
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      return { 
        suggestions: [
          "Tell me about my upcoming assignments",
          "Can you explain a difficult concept?",
          "Help me prepare for my next exam" 
        ]
      };
    }
  }

  // Helper methods
  private getCurrentUserId(): string {
    // In a real app, this would fetch the current user's ID from authentication context
    // For mock purposes, we'll use a default ID based on role
    return "student-1"; // Change this depending on the user role
  }

  private getMockConversation(userId: string): Message[] {
    // Get all messages between current user and specified user
    const currentUserId = this.getCurrentUserId();
    const conversation = this.mockMessages.filter(msg => 
      (msg.senderId === currentUserId && msg.receiverId === userId) ||
      (msg.senderId === userId && msg.receiverId === currentUserId)
    );
    
    // Add the isMine property
    const processedConversation = conversation.map(msg => ({
      ...msg,
      isMine: msg.senderId === currentUserId
    }));
    
    // Sort by sent time
    return processedConversation.sort((a, b) => 
      new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
    );
  }

  // Mock data initialization
  private initMockMessages() {
    const teacherId = "teacher-1";
    const studentId = "student-1";
    const adminId = "admin-1";
    
    this.mockMessages = [
      {
        id: "msg-1",
        senderId: teacherId,
        receiverId: studentId,
        subject: "About your assignment",
        content: "Hello, I noticed that you haven't submitted your assignment yet. Is everything okay?",
        sentAt: "2023-03-25T10:30:00Z",
        status: "read",
        readAt: "2023-03-25T11:15:00Z"
      },
      {
        id: "msg-2",
        senderId: studentId,
        receiverId: teacherId,
        subject: "Re: About your assignment",
        content: "Hi teacher, I've been having some technical issues. I'll submit it by tomorrow.",
        sentAt: "2023-03-25T11:20:00Z",
        status: "read",
        readAt: "2023-03-25T12:00:00Z"
      },
      {
        id: "msg-3",
        senderId: teacherId,
        receiverId: studentId,
        subject: "Re: About your assignment",
        content: "That's fine. Let me know if you need any help!",
        sentAt: "2023-03-25T12:05:00Z",
        status: "delivered"
      },
      {
        id: "msg-4",
        senderId: adminId,
        receiverId: studentId,
        subject: "Tuition fees reminder",
        content: "This is a friendly reminder that your tuition fees for the next semester are due next week.",
        sentAt: "2023-03-26T09:00:00Z",
        status: "delivered"
      }
    ];
    
    // Add AI assistant conversation if it doesn't exist
    const aiMessages = this.mockMessages.filter(
      msg => msg.senderId === this.AI_ASSISTANT_ID || msg.receiverId === this.AI_ASSISTANT_ID
    );
    
    if (aiMessages.length === 0) {
      // Add a welcome message from the AI assistant
      this.mockMessages.push({
        id: "ai-welcome",
        senderId: this.AI_ASSISTANT_ID,
        receiverId: studentId,
        subject: "Welcome",
        content: "Hello! I'm your AI assistant. I can help you with your studies, answer questions, analyze text, and more. How can I assist you today?",
        sentAt: "2023-03-24T09:00:00Z",
        status: "read",
        readAt: "2023-03-24T09:05:00Z"
      });
    }
  }

  private initMockPartners() {
    const teacherId = "teacher-1";
    const studentId = "student-1";
    const adminId = "admin-1";
    
    this.mockPartners = [
      {
        userId: teacherId,
        name: "John Smith",
        avatar: null,
        lastMessage: "That's fine. Let me know if you need any help!",
        lastMessageTime: "2023-03-25T12:05:00Z",
        unreadCount: 1
      },
      {
        userId: adminId,
        name: "Admin",
        avatar: null,
        lastMessage: "This is a friendly reminder that your tuition fees for the next semester are due next week.",
        lastMessageTime: "2023-03-26T09:00:00Z",
        unreadCount: 1
      }
    ];
    
    // Add AI assistant if it doesn't exist
    if (!this.mockPartners.find(p => p.userId === this.AI_ASSISTANT_ID)) {
      this.mockPartners.push(this.getAIAssistantProfile());
    }
  }

  private initMockRecipients() {
    this.mockRecipients = [
      {
        id: "teacher-1",
        fullName: "John Smith",
        avatar: null,
        role: "Teacher"
      },
      {
        id: "teacher-2",
        fullName: "Mary Johnson",
        avatar: null,
        role: "Teacher"
      },
      {
        id: "admin-1",
        fullName: "Admin",
        avatar: null,
        role: "Admin"
      }
    ];
    
    // Add AI assistant if it doesn't exist
    if (!this.mockRecipients.find(r => r.id === this.AI_ASSISTANT_ID)) {
      this.mockRecipients.push(this.getAIAssistantRecipient());
    }
  }
}

export const messageService = new MessageServiceClass(); 