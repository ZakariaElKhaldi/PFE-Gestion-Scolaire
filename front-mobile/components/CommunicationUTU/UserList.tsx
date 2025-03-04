import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '@/types/chat';
import Avatar from './Avatar';
import { useChat } from '../context/ChatContext';

const UserList: React.FC = () => {
  const { onlineUsers, offlineUsers, selectedUser, setSelectedUser } = useChat();

  const handleUserSelect = (user: User) => {
    setSelectedUser(user.id === selectedUser?.id ? null : user);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Team Members</Text>
        <Text style={styles.headerSubtitle}>Select a user to start a private chat</Text>
      </View>
      
      <ScrollView style={styles.userList}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Online — {onlineUsers.length}</Text>
            <View style={styles.onlineIndicator} />
          </View>
          
          {onlineUsers.map(user => (
            <TouchableOpacity 
              key={user.id}
              onPress={() => handleUserSelect(user)}
              style={[
                styles.userItem,
                selectedUser?.id === user.id && styles.selectedUserItem
              ]}
            >
              <Avatar src={user.avatar} alt={user.name} online={true} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userStatus}>Active now</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Offline — {offlineUsers.length}</Text>
            <View style={styles.offlineIndicator} />
          </View>
          
          {offlineUsers.map(user => (
            <TouchableOpacity 
              key={user.id}
              onPress={() => handleUserSelect(user)}
              style={[
                styles.userItem,
                selectedUser?.id === user.id && styles.selectedUserItem
              ]}
            >
              <Avatar src={user.avatar} alt={user.name} online={false} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userStatus}>Last seen {user.lastSeen}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  userList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  offlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  selectedUserItem: {
    backgroundColor: '#dbeafe',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  userStatus: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default UserList;