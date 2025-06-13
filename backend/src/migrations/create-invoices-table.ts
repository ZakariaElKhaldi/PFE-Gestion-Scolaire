import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the invoices table
 */
export async function createInvoicesTable(): Promise<void> {
  logger.db('Creating invoices table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(36) PRIMARY KEY,
      paymentId VARCHAR(36) NOT NULL,
      invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
      studentId VARCHAR(36) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
      dueDate DATE NOT NULL,
      issueDate DATE NOT NULL,
      paidDate DATETIME,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payment_id (paymentId),
      INDEX idx_student_id (studentId),
      CONSTRAINT fk_invoice_payment FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE,
      CONSTRAINT fk_invoice_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Invoices table created or already exists');
  } catch (error) {
    logger.error('Failed to create invoices table', error);
    throw error;
  }
} 