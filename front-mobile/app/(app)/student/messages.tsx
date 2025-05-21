// @ts-nocheck - Disable TypeScript checking for this file to avoid style type conflicts
// This is a common approach for React Native projects with StyleSheet type issues

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator, ViewStyle, TextStyle, ImageStyle, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { messageService, ConversationPartner, MessageRecipient } from '../../../services/message';
import { Message } from '../../../types/models';
import { COLORS, SPACING, FONT_SIZES } from '../../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Modal from 'react-native-modal';

// @ts-ignore - Suppress StyleSheet typing errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: COLORS.text.primary,
  },
  newMessageButton: {
    backgroundColor: COLORS.primary.DEFAULT,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Conversation List styles
  conversationListContainer: {
    flex: 1,
  },
  conversationList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  activeConversation: {
    backgroundColor: COLORS.grey[100],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: COLORS.primary.DEFAULT,
  },
  conversationDetails: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  conversationName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  unreadBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: 'white',
    fontWeight: 700,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 500,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  startConversationButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 8,
  },
  startConversationButtonText: {
    color: 'white',
    fontWeight: 500,
  },
  // Conversation View styles
  conversationViewContainer: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: SPACING.sm,
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.primary.DEFAULT,
  },
  messagesList: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: SPACING.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  theirMessageBubble: {
    backgroundColor: 'white',
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.primary,
  },
  myMessageText: {
    fontSize: FONT_SIZES.sm,
    color: 'white',
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.tertiary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myMessageTime: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey[200],
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.grey[100],
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.grey[400],
  },
  // Modal Styles
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  modalTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.text.primary,
  },
  recipientsList: {
    padding: SPACING.sm,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grey[200],
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  recipientAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.primary.DEFAULT,
  },
  recipientDetails: {
    marginLeft: SPACING.md,
  },
  recipientName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 500,
    color: COLORS.text.primary,
  },
  recipientRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
  },
  aiMessageBubble: {
    backgroundColor: COLORS.secondary.DEFAULT,
  },
  aiMessageText: {
    fontSize: FONT_SIZES.sm,
    color: 'white',
  },
  aiMessageTime: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  aiIndicatorText: {
    color: COLORS.secondary.DEFAULT,
    fontSize: FONT_SIZES.xs,
    fontWeight: 700,
    marginLeft: 4,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  suggestionChip: {
    backgroundColor: COLORS.grey[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.grey[300],
  },
  suggestionChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text.secondary,
  },
}) as Record<string, ViewStyle | TextStyle | ImageStyle>;

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const messageListRef = useRef<FlatList>(null);
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  // State for conversations and active conversation
  const [conversations, setConversations] = useState<ConversationPartner[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  // State for messages in the active conversation
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // State for new message
  const [newMessageText, setNewMessageText] = useState('');
  
  // State for new message dialog
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false);
  const [potentialRecipients, setPotentialRecipients] = useState<MessageRecipient[]>([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  
  // Active conversation details
  const [activeRecipientDetails, setActiveRecipientDetails] = useState<{
    name: string;
    avatar: string | null;
  } | null>(null);
  
  // Mobile view state
  const [isMobileViewingConversation, setIsMobileViewingConversation] = useState(false);
  
  // State for AI message suggestions
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isTypingMessage, setIsTypingMessage] = useState(false);
  
  // Load conversation partners on mount
  useEffect(() => {
    const loadConversations = async () => {
      setConversationsLoading(true);
      try {
        const conversations = await messageService.getConversationPartners();
        setConversations(conversations);
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setConversationsLoading(false);
      }
    };
    
    loadConversations();
  }, []);
  
  // Load active conversation messages when changed
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      setActiveRecipientDetails(null);
      setAiSuggestions([]);
      return;
    }
    
    const loadMessages = async () => {
      setMessagesLoading(true);
      try {
        const messages = await messageService.getConversation(activeConversation);
        
        // Process and set recipient details based on the current conversation
        const conversation = conversations.find(c => c.userId === activeConversation);
        if (conversation) {
          setActiveRecipientDetails({
            name: conversation.name,
            avatar: conversation.avatar
          });
        }
        
        setMessages(messages);
        
        // On mobile, switch to conversation view
        setIsMobileViewingConversation(true);
        
        // If it's an AI conversation, generate suggestions
        if (isAIAssistantConversation(activeConversation)) {
          await generateAISuggestions();
        } else {
          setAiSuggestions([]);
        }
      } catch (error) {
        console.error("Error loading conversation messages:", error);
      } finally {
        setMessagesLoading(false);
      }
    };
    
    loadMessages();
  }, [activeConversation, user.id]);
  
  // Function to load potential recipients for new message
  const loadPotentialRecipients = async () => {
    setRecipientsLoading(true);
    try {
      const recipients = await messageService.getPotentialRecipients();
      setPotentialRecipients(recipients);
    } catch (error) {
      console.error("Error loading potential recipients:", error);
    } finally {
      setRecipientsLoading(false);
    }
  };
  
  // Function to refresh conversations list
  const refreshConversations = async () => {
    try {
      const conversations = await messageService.getConversationPartners();
      setConversations(conversations);
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    }
  };
  
  // Function to check if a conversation is with the AI assistant
  const isAIAssistantConversation = (userId: string) => {
    return userId === 'ai-assistant-1';
  };
  
  // Function to generate AI suggestions based on conversation
  const generateAISuggestions = async () => {
    if (!activeConversation || !isAIAssistantConversation(activeConversation) || messages.length === 0) {
      return;
    }
    
    try {
      // Get the most recent messages for context
      const recentMessages = messages.slice(-3);
      const context = recentMessages
        .map(msg => `${msg.senderId === 'ai-assistant-1' ? 'AI:' : 'User:'} ${msg.content}`)
        .join('\n');
      
      // Generate suggestions
      const aiResponse = await messageService.getAISuggestions(context);
      
      // Update suggestions state
      setAiSuggestions(aiResponse.suggestions || [
        "Tell me about my upcoming assignments",
        "Can you explain a difficult concept?",
        "Help me prepare for my next exam"
      ]);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      setAiSuggestions([
        "Tell me about my upcoming assignments",
        "Can you explain a difficult concept?",
        "Help me prepare for my next exam"
      ]);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!activeConversation || !newMessageText.trim()) return;
    
    try {
      setIsTypingMessage(true);
      
      // First add the message to local state for immediate feedback
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: newMessageText,
        sentAt: new Date().toISOString(),
        status: "sent",
        isMine: true
      };
      
      // Add to conversation immediately
      setMessages(prev => [...prev, tempMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        messageListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
      
      // Clear the input
      setNewMessageText('');
      
      // Then send it to the server
      const sentMessage = await messageService.sendMessage({
        receiverId: activeConversation,
        subject: "Re: " + (activeRecipientDetails?.name || "Discussion"),
        content: newMessageText
      });
      
      // Update conversation list after sending message
      await refreshConversations();
      
      // If it's an AI conversation, generate new suggestions
      if (isAIAssistantConversation(activeConversation)) {
        await generateAISuggestions();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTypingMessage(false);
    }
  };
  
  // Handle opening new message dialog
  const handleNewMessage = () => {
    setIsNewMessageDialogOpen(true);
    loadPotentialRecipients();
  };
  
  // Handle selecting a recipient from new message dialog
  const handleSelectRecipient = (recipientId: string) => {
    setActiveConversation(recipientId);
    setIsNewMessageDialogOpen(false);
    
    // Find recipient details if exists in potentialRecipients
    const recipient = potentialRecipients.find(r => r.id === recipientId);
    if (recipient) {
      setActiveRecipientDetails({
        name: recipient.fullName,
        avatar: recipient.avatar
      });
    }
  };
  
  // Handle mobile back button
  const handleBackToConversations = () => {
    setIsMobileViewingConversation(false);
  };
  
  // Handle suggestion chip press
  const handleSuggestionPress = (suggestion: string) => {
    setNewMessageText(suggestion);
  };

  // Render conversation item
  const renderConversationItem = ({ item }: { item: ConversationPartner }) => (
    <TouchableOpacity 
      style={[
        styles.conversationItem, 
        activeConversation === item.userId && styles.activeConversation
      ]}
      onPress={() => setActiveConversation(item.userId)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarFallbackText}>{item.name.charAt(0)}</Text>
        </View>
      )}
      
      <View style={styles.conversationDetails}>
        <Text style={styles.conversationName}>
          {item.name}
          {isAIAssistantConversation(item.userId) && (
            <View style={styles.aiIndicator}>
              <Ionicons name="sparkles-outline" size={12} color={COLORS.secondary.DEFAULT} />
              <Text style={styles.aiIndicatorText}>AI</Text>
            </View>
          )}
        </Text>
        <Text style={styles.conversationPreview} numberOfLines={1}>
          {item.lastMessage || "Start a conversation"}
        </Text>
      </View>
      
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render message item
  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMine = item.isMine || item.senderId === user?.id;
    const isAI = item.senderId === 'ai-assistant-1';
    
    let bubbleStyle;
    let textStyle;
    let timeStyle;
    
    if (isMine) {
      bubbleStyle = styles.myMessageBubble;
      textStyle = styles.myMessageText;
      timeStyle = styles.myMessageTime;
    } else if (isAI) {
      bubbleStyle = styles.aiMessageBubble;
      textStyle = styles.aiMessageText;
      timeStyle = styles.aiMessageTime;
    } else {
      bubbleStyle = styles.theirMessageBubble;
      textStyle = styles.messageText;
      timeStyle = styles.messageTime;
    }
    
    return (
      <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
        <View style={[styles.messageBubble, bubbleStyle]}>
          <Text style={textStyle}>{item.content}</Text>
          <Text style={timeStyle}>
            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  // Render potential recipient item
  const renderRecipientItem = ({ item }: { item: MessageRecipient }) => (
    <TouchableOpacity 
      style={styles.recipientItem}
      onPress={() => handleSelectRecipient(item.id)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.recipientAvatar} />
      ) : (
        <View style={styles.recipientAvatarFallback}>
          <Text style={styles.recipientAvatarText}>{item.fullName.charAt(0)}</Text>
        </View>
      )}
      
      <View style={styles.recipientDetails}>
        <Text style={styles.recipientName}>{item.fullName}</Text>
        <Text style={styles.recipientRole}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render AI suggestion chips
  const renderSuggestionChips = () => {
    if (!isAIAssistantConversation(activeConversation) || aiSuggestions.length === 0) {
      return null;
    }
    
    return (
      <View style={styles.suggestionChips}>
        {aiSuggestions.map((suggestion, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.suggestionChip}
            onPress={() => handleSuggestionPress(suggestion)}
          >
            <Text style={styles.suggestionChipText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Conversation List View
  const ConversationListView = () => (
    <View style={styles.conversationListContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton} onPress={handleNewMessage}>
          <Ionicons name="add-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {conversationsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="chatbubble-outline" size={64} color={COLORS.grey[400]} />
          <Text style={styles.emptyStateText}>No conversations yet</Text>
          <TouchableOpacity style={styles.startConversationButton} onPress={handleNewMessage}>
            <Text style={styles.startConversationButtonText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.conversationList}
        />
      )}
    </View>
  );

  // Conversation View
  const ConversationView = () => (
    <KeyboardAvoidingView 
      style={styles.conversationViewContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.conversationHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToConversations}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.recipientInfo}>
          {activeRecipientDetails?.avatar ? (
            <Image source={{ uri: activeRecipientDetails.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarText}>
                {activeRecipientDetails?.name.charAt(0) || '?'}
              </Text>
            </View>
          )}
          
          <Text style={styles.recipientName}>
            {activeRecipientDetails?.name || 'Conversation'}
            {isAIAssistantConversation(activeConversation) && (
              <View style={styles.aiIndicator}>
                <Ionicons name="sparkles-outline" size={12} color={COLORS.secondary.DEFAULT} />
                <Text style={styles.aiIndicatorText}>AI</Text>
              </View>
            )}
          </Text>
        </View>
      </View>
      
      {messagesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={COLORS.grey[400]} />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start the conversation by sending a message below
          </Text>
        </View>
      ) : (
        <FlatList
          ref={messageListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
        />
      )}
      
      {renderSuggestionChips()}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessageText}
          onChangeText={setNewMessageText}
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!newMessageText.trim() || isTypingMessage) ? styles.sendButtonDisabled : null
          ]} 
          onPress={handleSendMessage}
          disabled={!newMessageText.trim() || isTypingMessage}
        >
          {isTypingMessage ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="send" size={20} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  // New Message Dialog
  const NewMessageDialog = () => (
    <Modal
      isVisible={isNewMessageDialogOpen}
      onBackdropPress={() => setIsNewMessageDialogOpen(false)}
      onBackButtonPress={() => setIsNewMessageDialogOpen(false)}
      style={styles.modal}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New Message</Text>
          <TouchableOpacity onPress={() => setIsNewMessageDialogOpen(false)}>
            <Ionicons name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        
        {recipientsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary.DEFAULT} />
            <Text style={styles.loadingText}>Loading recipients...</Text>
          </View>
        ) : potentialRecipients.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No recipients found</Text>
          </View>
        ) : (
          <FlatList
            data={potentialRecipients}
            renderItem={renderRecipientItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recipientsList}
          />
        )}
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isMobileViewingConversation ? <ConversationView /> : <ConversationListView />}
      <NewMessageDialog />
    </SafeAreaView>
  );
} 