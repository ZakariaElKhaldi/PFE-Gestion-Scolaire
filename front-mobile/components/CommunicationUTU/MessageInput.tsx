import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useChat } from '../context/ChatContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming you're using MaterialIcons for icons

const MessageInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const { sendMessage, selectedUser } = useChat();

  const handleSubmit = () => {
    if (message.trim()) {
      sendMessage(message, selectedUser?.id || null);
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {}} // Add functionality for the button if needed
        >
          <Icon name="add" size={24} color="#6b7280" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={selectedUser ? `Message ${selectedUser.name}...` : "Message everyone..."}
          placeholderTextColor="#9ca3af"
        />
        
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={handleSubmit}
          disabled={!message.trim()}
        >
          <Icon name="send" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  sendButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    opacity: 1,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default MessageInput;