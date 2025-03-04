export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  lastSeen?: string; // Optional property
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null; // Can be null for broadcast messages
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  users: User[];
  messages: Message[];
}
