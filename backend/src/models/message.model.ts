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
  async getMessages(filter: MessageFilter = {}): Promise<Message[]> {
    try {
      let query = `
        SELECT m.*, 
               u1.full_name AS senderName, 
               u1.avatar AS senderAvatar,
               u2.full_name AS receiverName, 
               u2.avatar AS receiverAvatar
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
      
      const [rows] = await queryAsync<MessageWithDetailsRow[]>(query, params);
      
      return rows.map(row => ({
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
  async getMessageById(id: string): Promise<Message | null> {
    try {
      const query = `
        SELECT m.*, 
               u1.full_name AS senderName, 
               u1.avatar AS senderAvatar,
               u2.full_name AS receiverName, 
               u2.avatar AS receiverAvatar
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE m.id = ?
      `;
      
      const [rows] = await queryAsync<MessageWithDetailsRow[]>(query, [id]);
      
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
      
      const [result] = await queryAsync<OkPacket>(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
  
  /**
   * Update message status and readAt timestamp
   */
  async updateMessageStatus(id: string, status: MessageStatus, readAt?: Date): Promise<Message | null> {
    try {
      let query = 'UPDATE messages SET status = ?';
      const params: any[] = [status];
      
      if (readAt && status === MessageStatus.READ) {
        query += ', read_at = ?';
        params.push(readAt);
      }
      
      query += ' WHERE id = ?';
      params.push(id);
      
      await queryAsync<OkPacket>(query, params);
      
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
      const query = `
        SELECT m.*, 
               u1.full_name AS senderName, 
               u1.avatar AS senderAvatar,
               u2.full_name AS receiverName, 
               u2.avatar AS receiverAvatar
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
           OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.sent_at ASC
      `;
      
      const [rows] = await queryAsync<MessageWithDetailsRow[]>(query, [
        userId1, userId2, userId2, userId1
      ]);
      
      return rows.map(row => ({
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
      const query = `
        SELECT 
          u.id AS userId,
          u.full_name AS name,
          u.avatar,
          (
            SELECT m.content
            FROM messages m
            WHERE (m.sender_id = u.id AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = u.id)
            ORDER BY m.sent_at DESC
            LIMIT 1
          ) AS lastMessage,
          (
            SELECT m.sent_at
            FROM messages m
            WHERE (m.sender_id = u.id AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = u.id)
            ORDER BY m.sent_at DESC
            LIMIT 1
          ) AS lastMessageTime,
          (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.sender_id = u.id 
              AND m.receiver_id = ?
              AND m.status != 'read'
          ) AS unreadCount
        FROM users u
        WHERE u.id != ?
          AND EXISTS (
            SELECT 1
            FROM messages m
            WHERE (m.sender_id = u.id AND m.receiver_id = ?)
               OR (m.sender_id = ? AND m.receiver_id = u.id)
          )
        ORDER BY lastMessageTime DESC
      `;
      
      const [rows] = await queryAsync<ConversationPartnerRow[]>(query, [
        userId, userId, userId, userId, userId, userId, userId, userId
      ]);
      
      return rows;
    } catch (error) {
      console.error('Error getting conversation partners:', error);
      throw error;
    }
  }
  
  /**
   * Get message counts for a user
   */
  async getMessageCounts(userId: string): Promise<MessageCounts> {
    try {
      const query = `
        SELECT 
          (
            SELECT COUNT(*)
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
          ) AS total,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE sender_id = ?
          ) AS sent,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE receiver_id = ?
          ) AS received,
          (
            SELECT COUNT(*)
            FROM messages
            WHERE receiver_id = ? AND status != 'read'
          ) AS unread
      `;
      
      const [rows] = await queryAsync<MessageCountsRow[]>(query, [
        userId, userId, userId, userId, userId
      ]);
      
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
export { MessageModel }; 