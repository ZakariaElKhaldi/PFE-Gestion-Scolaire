import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the subscriptions table
 */
export async function createSubscriptionsTable(): Promise<void> {
  logger.db('Creating subscriptions table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(36) PRIMARY KEY,
      studentId VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      amount DECIMAL(10, 2) NOT NULL,
      frequency ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
      startDate DATE NOT NULL,
      endDate DATE,
      nextBillingDate DATE NOT NULL,
      status ENUM('active', 'paused', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
      paymentMethodId VARCHAR(36),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_student_id (studentId),
      INDEX idx_payment_method (paymentMethodId),
      CONSTRAINT fk_subscription_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_subscription_payment_method FOREIGN KEY (paymentMethodId) REFERENCES payment_methods(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Subscriptions table created or already exists');
  } catch (error) {
    logger.error('Failed to create subscriptions table', error);
    throw error;
  }
} 