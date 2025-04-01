import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the messages table
 */
export async function createMessagesTable(): Promise<void> {
  logger.db('Creating messages table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      sender_id VARCHAR(36) NOT NULL,
      receiver_id VARCHAR(36) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP NULL,
      status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_sender (sender_id),
      INDEX idx_receiver (receiver_id),
      INDEX idx_status (status),
      INDEX idx_sent_at (sent_at)
    )
  `;
  
  try {
    await query(sql);
    logger.db('Messages table created or already exists');
  } catch (error) {
    logger.error('Failed to create messages table', error);
    throw error;
  }
} 