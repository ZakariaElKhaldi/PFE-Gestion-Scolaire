import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { logger } from '../utils/logger';
import { PaymentModel } from './Payment';

export interface Subscription {
  id: string;
  studentId: string;
  name: string;
  description: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  status: 'active' | 'cancelled' | 'expired' | 'suspended';
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionModel {
  static async create(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    // First, check if the subscriptions table exists, if not create it
    await this.ensureSubscriptionsTableExists();
    
    const id = uuidv4();
    const sql = `
      INSERT INTO subscriptions (
        id, 
        studentId, 
        name, 
        description, 
        amount, 
        frequency, 
        startDate, 
        endDate, 
        nextBillingDate, 
        status, 
        paymentMethodId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      subscription.studentId,
      subscription.name,
      subscription.description,
      subscription.amount,
      subscription.frequency,
      subscription.startDate,
      subscription.endDate || null,
      subscription.nextBillingDate,
      subscription.status,
      subscription.paymentMethodId || null
    ];

    try {
      await query(sql, params);
      logger.info(`Subscription created with ID: ${id}`);
      
      const newSubscription = await this.findById(id);
      if (!newSubscription) {
        throw new Error(`Failed to retrieve created subscription with ID: ${id}`);
      }
      return newSubscription;
    } catch (error) {
      logger.error('Error creating subscription', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<Subscription | null> {
    const sql = `SELECT * FROM subscriptions WHERE id = ?`;
    try {
      const subscriptions = await query<Subscription>(sql, [id]);
      return subscriptions.length > 0 ? subscriptions[0] : null;
    } catch (error) {
      logger.error(`Error finding subscription with ID: ${id}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: string): Promise<Subscription[]> {
    const sql = `SELECT * FROM subscriptions WHERE studentId = ? ORDER BY createdAt DESC`;
    try {
      return await query<Subscription>(sql, [studentId]);
    } catch (error) {
      logger.error(`Error finding subscriptions for student: ${studentId}`, error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: Subscription['status']): Promise<boolean> {
    const sql = `
      UPDATE subscriptions 
      SET status = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [status, id]);
      logger.info(`Subscription ${id} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating subscription status: ${id}`, error);
      throw error;
    }
  }

  static async updateNextBillingDate(id: string, nextBillingDate: Date): Promise<boolean> {
    const sql = `
      UPDATE subscriptions 
      SET nextBillingDate = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [nextBillingDate, id]);
      logger.info(`Subscription ${id} next billing date updated to ${nextBillingDate}`);
      return true;
    } catch (error) {
      logger.error(`Error updating subscription next billing date: ${id}`, error);
      throw error;
    }
  }

  static async cancel(id: string, endDate?: Date): Promise<boolean> {
    const sql = `
      UPDATE subscriptions 
      SET status = 'cancelled',
          endDate = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [endDate || new Date(), id]);
      logger.info(`Subscription ${id} cancelled`);
      return true;
    } catch (error) {
      logger.error(`Error cancelling subscription: ${id}`, error);
      throw error;
    }
  }

  static async getActiveSubscriptions(): Promise<Subscription[]> {
    const sql = `
      SELECT * FROM subscriptions 
      WHERE status = 'active' 
      ORDER BY nextBillingDate ASC
    `;
    
    try {
      return await query<Subscription>(sql, []);
    } catch (error) {
      logger.error('Error getting active subscriptions', error);
      throw error;
    }
  }

  static async getSubscriptionsDueForRenewal(date: Date = new Date()): Promise<Subscription[]> {
    const sql = `
      SELECT * FROM subscriptions 
      WHERE status = 'active' 
      AND nextBillingDate <= ?
      ORDER BY nextBillingDate ASC
    `;
    
    try {
      return await query<Subscription>(sql, [date]);
    } catch (error) {
      logger.error('Error getting subscriptions due for renewal', error);
      throw error;
    }
  }

  static async updatePaymentMethod(id: string, paymentMethodId: string): Promise<boolean> {
    const sql = `
      UPDATE subscriptions 
      SET paymentMethodId = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [paymentMethodId, id]);
      logger.info(`Subscription ${id} payment method updated to ${paymentMethodId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating subscription payment method: ${id}`, error);
      throw error;
    }
  }

  static async processRenewal(subscription: Subscription): Promise<boolean> {
    try {
      // Calculate next billing date based on frequency
      const nextBillingDate = this.calculateNextBillingDate(subscription.nextBillingDate, subscription.frequency);
      
      // Create a new payment for this renewal
      await PaymentModel.create({
        studentId: subscription.studentId,
        amount: subscription.amount,
        description: `Subscription renewal: ${subscription.name}`,
        status: 'pending',
        paymentMethod: 'credit_card', // Default, can be updated based on payment method
        paymentGateway: 'manual', // Default, can be updated based on payment method
        dueDate: new Date(), // Due immediately
      });
      
      // Update the subscription's next billing date
      await this.updateNextBillingDate(subscription.id, nextBillingDate);
      
      logger.info(`Processed renewal for subscription ${subscription.id}`);
      return true;
    } catch (error) {
      logger.error(`Error processing renewal for subscription: ${subscription.id}`, error);
      throw error;
    }
  }

  private static calculateNextBillingDate(currentDate: Date, frequency: Subscription['frequency']): Date {
    const date = new Date(currentDate);
    
    switch (frequency) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semi-annual':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'annual':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date;
  }

  private static async ensureSubscriptionsTableExists(): Promise<void> {
    try {
      // Check if the table exists
      const tables = await query<{Tables_in_pfe: string}[]>(`SHOW TABLES LIKE 'subscriptions'`);
      
      if (tables.length === 0) {
        // Create the subscriptions table if it doesn't exist
        const createTableSql = `
          CREATE TABLE IF NOT EXISTS subscriptions (
            id VARCHAR(36) PRIMARY KEY,
            studentId VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            frequency ENUM('monthly', 'quarterly', 'semi-annual', 'annual') NOT NULL,
            startDate DATE NOT NULL,
            endDate DATE DEFAULT NULL,
            nextBillingDate DATE NOT NULL,
            status ENUM('active', 'cancelled', 'expired', 'suspended') NOT NULL DEFAULT 'active',
            paymentMethodId VARCHAR(36) DEFAULT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_student_id (studentId),
            CONSTRAINT fk_subscription_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `;
        
        await query(createTableSql);
        logger.info('Subscriptions table created');
      }
    } catch (error) {
      logger.error('Error ensuring subscriptions table exists', error);
      throw error;
    }
  }
} 