export interface User {
    id: string;
    name: string;
    avatar: string; // URL of avatar image
    online: boolean;
    lastSeen?: string; // Optional for offline users
  }
  
  export interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string | null; // Null for group messages
    timestamp: string; // ISO string
    read: boolean;
  }
  
  export interface ChatRoom {
    id: string;
    name: string;
    users: User[];
    messages: Message[];
  }
  