import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the payment methods table
 */
export async function createPaymentMethodsTable(): Promise<void> {
  logger.db('Creating payment methods table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS payment_methods (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      type ENUM('credit_card', 'paypal', 'bank_account', 'stripe') NOT NULL,
      provider ENUM('paypal', 'stripe', 'manual') NOT NULL,
      token VARCHAR(255),
      lastFour VARCHAR(4),
      expiryDate VARCHAR(7),
      cardBrand VARCHAR(50),
      isDefault BOOLEAN NOT NULL DEFAULT FALSE,
      billingDetails JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_id (studentId),
      CONSTRAINT fk_payment_method_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Payment methods table created or already exists');
  } catch (error) {
    logger.error('Failed to create payment methods table', error);
    throw error;
  }
} 