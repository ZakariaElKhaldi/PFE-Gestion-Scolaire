import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MessageModel, MessageStatus, Message, CreateMessageDTO, MessageFilter, MessageWithUserDetails } from '../models/message.model';
import { UserModel } from '../models/user.model';

class MessageController {
  /**
   * Get all messages with optional filtering
   */
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const filters: MessageFilter = {
        ...req.query as any,
      };

      // Get messages involving the current user
      const messages = await MessageModel.getMessages(filters);

      return res.status(200).json({
        messages,
        count: messages.length
      });
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get a specific message by ID
   */
  async getMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const messageId = req.params.id;
      const message = await MessageModel.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Check if user has permission to view this message
      if (message.senderId !== userId && message.receiverId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to view this message' });
      }

      return res.status(200).json({ message });
    } catch (error: any) {
      console.error('Error fetching message:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Create a new message
   */
  async createMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { receiverId, subject, content } = req.body;

      if (!receiverId || !subject || !content) {
        return res.status(400).json({ error: 'receiverId, subject, and content are required' });
      }

      // Check if receiver exists
      const receiver = await UserModel.getUserById(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Recipient not found' });
      }

      const messageData: CreateMessageDTO = {
        senderId: userId,
        receiverId,
        subject,
        content
      };

      const message = await MessageModel.createMessage(messageData);

      return res.status(201).json({ message });
    } catch (error: any) {
      console.error('Error creating message:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const messageId = req.params.id;
      const message = await MessageModel.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Check if user has permission to delete this message
      if (message.senderId !== userId && message.receiverId !== userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this message' });
      }

      await MessageModel.deleteMessage(messageId);

      return res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const messageId = req.params.id;
      const message = await MessageModel.getMessageById(messageId);

      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      // Only the recipient can mark a message as read
      if (message.receiverId !== userId) {
        return res.status(403).json({ error: 'Only the recipient can mark a message as read' });
      }

      // If already read, just return the message
      if (message.status === MessageStatus.READ) {
        return res.status(200).json({ message });
      }

      // Update message as read
      const updatedMessage = await MessageModel.updateMessageStatus(
        messageId, 
        MessageStatus.READ,
        new Date()
      );

      return res.status(200).json({ message: updatedMessage });
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get inbox messages (received by current user)
   */
  async getInbox(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const filters: MessageFilter = {
        ...req.query as any,
        receiverId: userId
      };

      const messages = await MessageModel.getMessages(filters);

      return res.status(200).json({
        messages,
        count: messages.length
      });
    } catch (error: any) {
      console.error('Error fetching inbox:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get sent messages (sent by current user)
   */
  async getSent(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const filters: MessageFilter = {
        ...req.query as any,
        senderId: userId
      };

      const messages = await MessageModel.getMessages(filters);

      return res.status(200).json({
        messages,
        count: messages.length
      });
    } catch (error: any) {
      console.error('Error fetching sent messages:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get unread messages for current user
   */
  async getUnread(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const filters: MessageFilter = {
        receiverId: userId,
        status: MessageStatus.SENT // Undelivered messages
      };

      const messages = await MessageModel.getMessages(filters);

      return res.status(200).json({
        messages,
        count: messages.length
      });
    } catch (error: any) {
      console.error('Error fetching unread messages:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get conversation between current user and another user
   */
  async getConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const otherUserId = req.params.userId;

      // Get messages in both directions
      const messages = await MessageModel.getConversation(userId, otherUserId);

      return res.status(200).json({
        messages,
        count: messages.length
      });
    } catch (error: any) {
      console.error('Error fetching conversation:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get conversation partners for current user
   */
  async getConversationPartners(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const partners = await MessageModel.getConversationPartners(userId);

      return res.status(200).json({
        partners,
        count: partners.length
      });
    } catch (error: any) {
      console.error('Error fetching conversation partners:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get potential message recipients (all users except current user)
   */
  async getPotentialRecipients(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const recipients = await UserModel.getPotentialMessageRecipients(userId);

      return res.status(200).json({
        recipients,
        count: recipients.length
      });
    } catch (error: any) {
      console.error('Error fetching potential recipients:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  /**
   * Get message statistics for current user
   */
  async getMessageCounts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const counts = await MessageModel.getMessageCounts(userId);

      return res.status(200).json(counts);
    } catch (error: any) {
      console.error('Error fetching message counts:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}

export const messageController = new MessageController(); 