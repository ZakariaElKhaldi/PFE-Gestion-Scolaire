import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the payments table
 */
export async function createPaymentsTable(): Promise<void> {
  logger.db('Creating payments table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
      paymentMethod ENUM('credit_card', 'paypal', 'bank_transfer', 'cash', 'stripe') NOT NULL,
      transactionId VARCHAR(255),
      paymentGateway ENUM('paypal', 'stripe', 'manual') NOT NULL DEFAULT 'manual',
      gatewayResponse JSON,
      dueDate DATE NOT NULL,
      paymentDate DATETIME,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_id (studentId),
      CONSTRAINT fk_payment_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Payments table created or already exists');
  } catch (error) {
    logger.error('Failed to create payments table', error);
    throw error;
  }
} 