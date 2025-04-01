import { RowDataPacket, ResultSetHeader, FieldPacket, OkPacket } from 'mysql2';
import { pool, queryAsync } from '../config/database';
import { v4 as uuid } from 'uuid';

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  sentAt: Date;
  readAt?: Date;
  status: MessageStatus;
}

export interface MessageWithUserDetails extends Message {
  senderName?: string;
  senderAvatar?: string;
  receiverName?: string;
  receiverAvatar?: string;
}

export interface CreateMessageDTO {
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
}

export interface MessageFilter {
  senderId?: string;
  receiverId?: string;
  status?: MessageStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
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
  lastMessageTime: Date;
  unreadCount: number;
}

interface MessageRow extends Message, RowDataPacket {}
interface MessageWithDetailsRow extends MessageWithUserDetails, RowDataPacket {}
interface ConversationPartnerRow extends ConversationPartner, RowDataPacket {}
interface MessageCountsRow extends MessageCounts, RowDataPacket {}

class MessageModel {
  /**
   * Get messages with optional filters
   */
  async getMessages(filter: MessageFilter = {}): Promise<MessageWithUserDetails[]> {
    try {
      let query = `
        SELECT m.*, 
               CONCAT(u1.firstName, ' ', u1.lastName) AS senderName, 
               NULL AS senderAvatar,
               CONCAT(u2.firstName, ' ', u2.lastName) AS receiverName, 
               NULL AS receiverAvatar
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (filter.senderId) {
        query += ' AND m.sender_id = ?';
        params.push(filter.senderId);
      }
      
      if (filter.receiverId) {
        query += ' AND m.receiver_id = ?';
        params.push(filter.receiverId);
      }
      
      if (filter.status) {
        query += ' AND m.status = ?';
        params.push(filter.status);
      }
      
      if (filter.startDate) {
        query += ' AND m.sent_at >= ?';
        params.push(filter.startDate);
      }
      
      if (filter.endDate) {
        query += ' AND m.sent_at <= ?';
        params.push(filter.endDate);
      }
      
      if (filter.search) {
        query += ' AND (m.subject LIKE ? OR m.content LIKE ?)';
        const searchTerm = `%${filter.search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      query += ' ORDER BY m.sent_at DESC';
      
      const [rows] = await queryAsync(query, params) as [MessageWithDetailsRow[], FieldPacket[]];
      
      return rows.map((row: MessageWithDetailsRow) => ({
        id: row.id,
        senderId: row.senderId,
        receiverId: row.receiverId,
        subject: row.subject,
        content: row.content,
        sentAt: row.sentAt,
        readAt: row.readAt,
        status: row.status,
        senderName: row.senderName,
        senderAvatar: row.senderAvatar,
        receiverName: row.receiverName,
        receiverAvatar: row.receiverAvatar
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific message by ID
   */
  async getMessageById(id: string): Promise<MessageWithUserDetails | null> {
    try {
      const query = `
        SELECT m.*, 
               CONCAT(u1.firstName, ' ', u1.lastName) AS senderName, 
               NULL AS senderAvatar,
               CONCAT(u2.firstName, ' ', u2.lastName) AS receiverName, 
               NULL AS receiverAvatar
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.id = ?
      `;
      
      const [rows] = await queryAsync(query, [id]) as [MessageWithDetailsRow[], FieldPacket[]];
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      
      return {
        id: row.id,
        senderId: row.senderId,
        receiverId: row.receiverId,
        subject: row.subject,
        content: row.content,
        sentAt: row.sentAt,
        readAt: row.readAt,
        status: row.status,
        senderName: row.senderName,
        senderAvatar: row.senderAvatar,
        receiverName: row.receiverName,
        receiverAvatar: row.receiverAvatar
      };
    } catch (error) {
      console.error('Error getting message by ID:', error);
      throw error;
    }
  }
  
  /**
   * Create a new message
   */
  async createMessage(data: CreateMessageDTO): Promise<Message> {
    try {
      const id = uuid();
      const now = new Date();
      
      const query = `
        INSERT INTO messages 
        (id, sender_id, receiver_id, subject, content, sent_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      await queryAsync(query, [
        id,
        data.senderId,
        data.receiverId,
        data.subject,
        data.content,
        now,
        MessageStatus.SENT
      ]);
      
      return {
        id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        subject: data.subject,
        content: data.content,
        sentAt: now,
        status: MessageStatus.SENT
      };
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }
  
  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM messages WHERE id = ?';
      
      const [result] = await queryAsync(query, [id]) as [OkPacket, FieldPacket[]];
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
  
  /**
   * Update message status and readAt timestamp
   */
  async updateMessageStatus(id: string, status: MessageStatus, readAt?: Date): Promise<MessageWithUserDetails | null> {
    try {
      let query = 'UPDATE messages SET status = ?';
      const params: any[] = [status];
      
      if (readAt && status === MessageStatus.READ) {
        query += ', read_at = ?';
        params.push(readAt);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await queryAsync(query, params) as [OkPacket, FieldPacket[]];
      
      return this.getMessageById(id);
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation between two users
   */
  async getConversation(userId1: string, userId2: string): Promise<MessageWithUserDetails[]> {
    try {
      // First check if the messages table exists
      const checkTableExists = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'messages'
      `;
      
      const [tableCheck] = await queryAsync(checkTableExists, []) as [any[], FieldPacket[]];
      
      if (!tableCheck || !tableCheck[0] || !tableCheck[0].tableExists) {
        // Table doesn't exist, return empty array
        return [];
      }
      
      // Now we'll examine the actual column names
      const getColumns = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages'
      `;
      
      const [columns] = await queryAsync(getColumns, []) as [any[], FieldPacket[]];
      
      // Default column names
      let senderIdColumn = 'senderId';
      let receiverIdColumn = 'receiverId';
      
      // Check if the column names are different
      if (columns && columns.length > 0) {
        const columnNames = columns.map((col: any) => col.COLUMN_NAME.toLowerCase());
        
        if (columnNames.includes('sender_id')) {
          senderIdColumn = 'sender_id';
        }
        
        if (columnNames.includes('receiver_id')) {
          receiverIdColumn = 'receiver_id';
        }
      }
      
      const query = `
        SELECT m.*, 
               CONCAT(u1.firstName, ' ', u1.lastName) AS senderName, 
               NULL AS senderAvatar,
               CONCAT(u2.firstName, ' ', u2.lastName) AS receiverName, 
               NULL AS receiverAvatar
        FROM messages m
        JOIN users u1 ON m.${senderIdColumn} = u1.id
        JOIN users u2 ON m.${receiverIdColumn} = u2.id
        WHERE (m.${senderIdColumn} = ? AND m.${receiverIdColumn} = ?)
           OR (m.${senderIdColumn} = ? AND m.${receiverIdColumn} = ?)
        ORDER BY m.sent_at ASC
      `;
      
      const [rows] = await queryAsync(query, [
        userId1, userId2, userId2, userId1
      ]) as [MessageWithDetailsRow[], FieldPacket[]];
      
      return rows.map((row: MessageWithDetailsRow) => ({
        id: row.id,
        senderId: row.senderId,
        receiverId: row.receiverId,
        subject: row.subject,
        content: row.content,
        sentAt: row.sentAt,
        readAt: row.readAt,
        status: row.status,
        senderName: row.senderName,
        senderAvatar: row.senderAvatar,
        receiverName: row.receiverName,
        receiverAvatar: row.receiverAvatar
      }));
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation partners for a user
   */
  async getConversationPartners(userId: string): Promise<ConversationPartner[]> {
    try {
      // First check if the messages table exists
      const checkTableExists = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'messages'
      `;
      
      const [tableCheck] = await queryAsync(checkTableExists, []) as [any[], FieldPacket[]];
      
      if (!tableCheck || !tableCheck[0] || !tableCheck[0].tableExists) {
        // Table doesn't exist, return empty array
        return [];
      }
      
      // Now we'll examine the actual column names
      const getColumns = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages'
      `;
      
      const [columns] = await queryAsync(getColumns, []) as [any[], FieldPacket[]];
      
      // Default column names
      let senderIdColumn = 'senderId';
      let receiverIdColumn = 'receiverId';
      
      // Check if the column names are different
      if (columns && columns.length > 0) {
        const columnNames = columns.map((col: any) => col.COLUMN_NAME.toLowerCase());
        
        if (columnNames.includes('sender_id')) {
          senderIdColumn = 'sender_id';
        }
        
        if (columnNames.includes('receiver_id')) {
          receiverIdColumn = 'receiver_id';
        }
      }
      
      // Get all potential users who could be conversation partners, regardless of existing messages
      const query = `
        SELECT 
          u.id AS userId,
          CONCAT(u.firstName, ' ', u.lastName) AS name,
          NULL AS avatar,
          '' AS lastMessage,
          NOW() AS lastMessageTime,
          0 AS unreadCount
        FROM users u
        WHERE u.id != ?
        AND u.role IN ('teacher', 'student', 'administrator')
        ORDER BY u.firstName, u.lastName
      `;
      
      const [rows] = await queryAsync(query, [userId]) as [ConversationPartnerRow[], FieldPacket[]];
      
      // Ensure we always return an array, even if empty
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      console.error('Error getting conversation partners:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
  
  /**
   * Get message counts for a user
   */
  async getMessageCounts(userId: string): Promise<MessageCounts> {
    try {
      // First check if the messages table exists
      const checkTableExists = `
        SELECT COUNT(*) as tableExists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'messages'
      `;
      
      const [tableCheck] = await queryAsync(checkTableExists, []) as [any[], FieldPacket[]];
      
      if (!tableCheck || !tableCheck[0] || !tableCheck[0].tableExists) {
        // Table doesn't exist, return default values
        return {
          total: 0,
          sent: 0,
          received: 0,
          unread: 0
        };
      }
      
      // Now get column names to determine the correct field names
      const getColumns = `
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'messages'
      `;
      
      const [columns] = await queryAsync(getColumns, []) as [any[], FieldPacket[]];
      
      // Default column names
      let senderIdColumn = 'sender_id';
      let receiverIdColumn = 'receiver_id';
      let statusColumn = 'status';
      
      // Check if the column names are different
      if (columns && columns.length > 0) {
        const columnNames = columns.map((col: any) => col.COLUMN_NAME.toLowerCase());
        
        if (columnNames.includes('senderid')) {
          senderIdColumn = 'senderId';
        }
        
        if (columnNames.includes('receiverid')) {
          receiverIdColumn = 'receiverId';
        }
      }
      
      // Build and execute the query with the correct column names
      const query = `
        SELECT 
          (
            SELECT COUNT(*)
            FROM messages
            WHERE ${senderIdColumn} = ? OR ${receiverIdColumn} = ?
          ) AS total,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE ${senderIdColumn} = ?
          ) AS sent,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE ${receiverIdColumn} = ?
          ) AS received,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE ${receiverIdColumn} = ? AND ${statusColumn} != 'read'
          ) AS unread
      `;
      
      const [rows] = await queryAsync(query, [
        userId, userId, userId, userId, userId
      ]) as [MessageCountsRow[], FieldPacket[]];
      
      if (rows.length === 0) {
        return {
          total: 0,
          sent: 0,
          received: 0,
          unread: 0
        };
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error getting message counts:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const messageModel = new MessageModel(); 