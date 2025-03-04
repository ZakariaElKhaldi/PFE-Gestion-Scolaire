import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useChat } from '../context/ChatContext';
import UserList from '@/components/CommunicationUTU/UserList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Avatar from './Avatar';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Ensure this package is installed

const Chat: React.FC = () => {
  const { currentUser, selectedUser, setSelectedUser } = useChat();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Professional Chat</Text>
            <View style={styles.betaTag}>
              <Text style={styles.betaText}>Beta</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Avatar src={currentUser.avatar} alt={currentUser.name} online={true} size="sm" />
          </View>
        </View>
      </View>
      
      <View style={styles.mainContent}>
        {/* Sidebar with users */}
        <View style={styles.sidebar}>
          <UserList />
        </View>
        
        {/* Chat area */}
        <View style={styles.chatArea}>
          {/* Chat header */}
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              {selectedUser ? (
                <>
                  <Avatar src={selectedUser.avatar} alt={selectedUser.name} online={selectedUser.online} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{selectedUser.name}</Text>
                    <Text style={styles.userStatus}>
                      {selectedUser.online ? 'Online' : `Last seen ${selectedUser.lastSeen}`}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.teamIcon}>
                    <Icon name="group" size={24} color="#3b82f6" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>Team Chat</Text>
                    <Text style={styles.userStatus}>Everyone in the project</Text>
                  </View>
                </>
              )}
            </View>
            
            {selectedUser && (
              <TouchableOpacity 
                onPress={() => setSelectedUser(null)}
                style={styles.closeButton}
              >
                <Icon name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Messages */}
          <MessageList />
          
          {/* Input */}
          <MessageInput />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  betaTag: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  betaText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginRight: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sidebar: {
    width: 320,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  chatArea: {
    flex: 1,
    flexDirection: 'column',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  userStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
});

export default Chat;