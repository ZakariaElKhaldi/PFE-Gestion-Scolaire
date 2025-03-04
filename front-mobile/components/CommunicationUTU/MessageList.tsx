import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useChat } from '../context/ChatContext';
import Avatar from './Avatar';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming you're using MaterialIcons for icons

const MessageList: React.FC = () => {
  const { filteredMessages, currentUser, selectedUser } = useChat();
  const messagesEndRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollToEnd({ animated: true });
    }
  }, [filteredMessages]);

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  return (
    <ScrollView 
      ref={messagesEndRef}
      contentContainerStyle={styles.container}
    >
      {filteredMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="chat" size={32} color="#9ca3af" />
          </View>
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            {selectedUser 
              ? `Start a private conversation with ${selectedUser.name}`
              : "Send a message to the whole team"}
          </Text>
        </View>
      ) : (
        filteredMessages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUser.id;
          const showAvatar = !isCurrentUser && 
                            (index === 0 || 
                             filteredMessages[index - 1].senderId !== message.senderId);
          
          return (
            <View 
              key={message.id} 
              style={[
                styles.messageContainer, 
                isCurrentUser ? styles.justifyEnd : styles.justifyStart
              ]}
            >
              <View 
                style={[
                  styles.messageContent, 
                  isCurrentUser ? styles.flexRowReverse : styles.flexRow
                ]}
              >
                {!isCurrentUser && showAvatar && (
                  <View style={styles.avatarContainer}>
                    <Avatar 
                      src={selectedUser?.avatar || '/avatars/user.jpg'} 
                      alt={selectedUser?.name || 'User'} 
                      size="sm" 
                    />
                  </View>
                )}
                
                <View 
                  style={[
                    styles.messageBubble, 
                    isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
                  ]}
                >
                  <Text style={styles.messageText}>{message.content}</Text>
                  <Text style={styles.timestamp}>
                    {formatTimestamp(message.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexRowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  currentUserBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageText: {
    fontSize: 14,
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default MessageList;