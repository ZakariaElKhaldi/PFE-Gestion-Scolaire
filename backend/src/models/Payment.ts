import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { logger } from '../utils/logger';

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'stripe';
  transactionId?: string;
  paymentGateway: 'paypal' | 'stripe' | 'manual';
  gatewayResponse?: any;
  dueDate: Date;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentModel {
  static async create(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const id = uuidv4();
    const sql = `
      INSERT INTO payments (
        id, 
        studentId, 
        amount, 
        description, 
        status, 
        paymentMethod, 
        transactionId, 
        paymentGateway, 
        gatewayResponse, 
        dueDate, 
        paymentDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      payment.studentId,
      payment.amount,
      payment.description,
      payment.status,
      payment.paymentMethod,
      payment.transactionId || null,
      payment.paymentGateway,
      payment.gatewayResponse ? JSON.stringify(payment.gatewayResponse) : null,
      payment.dueDate,
      payment.paymentDate || null
    ];

    try {
      await query(sql, params);
      logger.info(`Payment created with ID: ${id}`);
      const newPayment = await this.findById(id);
      if (!newPayment) {
        throw new Error(`Failed to retrieve created payment with ID: ${id}`);
      }
      return newPayment;
    } catch (error) {
      logger.error('Error creating payment', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<Payment | null> {
    const sql = `SELECT * FROM payments WHERE id = ?`;
    try {
      const payments = await query<Payment>(sql, [id]);
      return payments.length > 0 ? payments[0] : null;
    } catch (error) {
      logger.error(`Error finding payment with ID: ${id}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: string): Promise<Payment[]> {
    const sql = `SELECT * FROM payments WHERE studentId = ? ORDER BY createdAt DESC`;
    try {
      return await query<Payment>(sql, [studentId]);
    } catch (error) {
      logger.error(`Error finding payments for student: ${studentId}`, error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: Payment['status'], paymentDate?: Date): Promise<boolean> {
    const sql = `
      UPDATE payments 
      SET status = ?, 
          paymentDate = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      const result = await query(sql, [status, paymentDate || null, id]);
      logger.info(`Payment ${id} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating payment status: ${id}`, error);
      throw error;
    }
  }

  static async updatePaymentDetails(
    id: string, 
    transactionId: string, 
    gatewayResponse: any, 
    status: Payment['status']
  ): Promise<boolean> {
    const sql = `
      UPDATE payments 
      SET transactionId = ?,
          gatewayResponse = ?,
          status = ?,
          paymentDate = CURRENT_TIMESTAMP,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [
        transactionId, 
        JSON.stringify(gatewayResponse), 
        status, 
        id
      ]);
      logger.info(`Payment ${id} details updated with transaction: ${transactionId}`);
      return true;
    } catch (error) {
      logger.error(`Error updating payment details: ${id}`, error);
      throw error;
    }
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<Payment[]> {
    const sql = `
      SELECT * FROM payments 
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      return await query<Payment>(sql, [limit, offset]);
    } catch (error) {
      logger.error('Error getting all payments', error);
      throw error;
    }
  }

  static async getByStatus(status: Payment['status'], limit: number = 100, offset: number = 0): Promise<Payment[]> {
    const sql = `
      SELECT * FROM payments 
      WHERE status = ?
      ORDER BY createdAt DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      return await query<Payment>(sql, [status, limit, offset]);
    } catch (error) {
      logger.error(`Error getting payments with status: ${status}`, error);
      throw error;
    }
  }

  static async getOverduePayments(): Promise<Payment[]> {
    const sql = `
      SELECT * FROM payments 
      WHERE status = 'pending' 
      AND dueDate < CURDATE()
      ORDER BY dueDate ASC
    `;
    
    try {
      return await query<Payment>(sql, []);
    } catch (error) {
      logger.error('Error getting overdue payments', error);
      throw error;
    }
  }
} 