import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { logger } from '../utils/logger';

export interface PaymentMethod {
  id: string;
  studentId: string;
  type: 'credit_card' | 'paypal' | 'bank_account' | 'stripe';
  provider: 'paypal' | 'stripe' | 'manual';
  token?: string;
  lastFour?: string;
  expiryDate?: string;
  cardBrand?: string;
  isDefault: boolean;
  billingDetails?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentMethodModel {
  static async create(paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    const id = uuidv4();
    const sql = `
      INSERT INTO payment_methods (
        id, 
        studentId, 
        type, 
        provider, 
        token, 
        lastFour, 
        expiryDate, 
        cardBrand, 
        isDefault, 
        billingDetails
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      paymentMethod.studentId,
      paymentMethod.type,
      paymentMethod.provider,
      paymentMethod.token || null,
      paymentMethod.lastFour || null,
      paymentMethod.expiryDate || null,
      paymentMethod.cardBrand || null,
      paymentMethod.isDefault ? 1 : 0,
      paymentMethod.billingDetails ? JSON.stringify(paymentMethod.billingDetails) : null
    ];

    try {
      // If this is set as default, unset any existing default methods for this student
      if (paymentMethod.isDefault) {
        await this.unsetDefaultForStudent(paymentMethod.studentId);
      }
      
      await query(sql, params);
      logger.info(`Payment method created with ID: ${id}`);
      
      const newMethod = await this.findById(id);
      if (!newMethod) {
        throw new Error(`Failed to retrieve created payment method with ID: ${id}`);
      }
      return newMethod;
    } catch (error) {
      logger.error('Error creating payment method', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<PaymentMethod | null> {
    const sql = `SELECT * FROM payment_methods WHERE id = ?`;
    try {
      const methods = await query<PaymentMethod>(sql, [id]);
      return methods.length > 0 ? methods[0] : null;
    } catch (error) {
      logger.error(`Error finding payment method with ID: ${id}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: string): Promise<PaymentMethod[]> {
    const sql = `SELECT * FROM payment_methods WHERE studentId = ? ORDER BY isDefault DESC, createdAt DESC`;
    try {
      return await query<PaymentMethod>(sql, [studentId]);
    } catch (error) {
      logger.error(`Error finding payment methods for student: ${studentId}`, error);
      throw error;
    }
  }

  static async getDefaultForStudent(studentId: string): Promise<PaymentMethod | null> {
    const sql = `SELECT * FROM payment_methods WHERE studentId = ? AND isDefault = 1 LIMIT 1`;
    try {
      const methods = await query<PaymentMethod>(sql, [studentId]);
      return methods.length > 0 ? methods[0] : null;
    } catch (error) {
      logger.error(`Error finding default payment method for student: ${studentId}`, error);
      throw error;
    }
  }

  static async unsetDefaultForStudent(studentId: string): Promise<boolean> {
    const sql = `UPDATE payment_methods SET isDefault = 0 WHERE studentId = ?`;
    try {
      await query(sql, [studentId]);
      return true;
    } catch (error) {
      logger.error(`Error unsetting default payment methods for student: ${studentId}`, error);
      throw error;
    }
  }

  static async setDefault(id: string): Promise<boolean> {
    try {
      // First, get the payment method to find the studentId
      const method = await this.findById(id);
      if (!method) {
        throw new Error(`Payment method with ID ${id} not found`);
      }
      
      // Unset any existing default methods for this student
      await this.unsetDefaultForStudent(method.studentId);
      
      // Set this method as default
      const sql = `UPDATE payment_methods SET isDefault = 1 WHERE id = ?`;
      await query(sql, [id]);
      
      logger.info(`Payment method ${id} set as default`);
      return true;
    } catch (error) {
      logger.error(`Error setting payment method ${id} as default`, error);
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM payment_methods WHERE id = ?`;
    try {
      await query(sql, [id]);
      logger.info(`Payment method ${id} deleted`);
      return true;
    } catch (error) {
      logger.error(`Error deleting payment method: ${id}`, error);
      throw error;
    }
  }

  static async update(
    id: string,
    updates: Partial<Omit<PaymentMethod, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>>
  ): Promise<boolean> {
    // Build the SQL dynamically based on what fields are being updated
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'billingDetails' && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else if (key === 'isDefault' && value === true) {
        updateFields.push(`${key} = ?`);
        values.push(1);
      } else if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      return true; // Nothing to update
    }
    
    const sql = `
      UPDATE payment_methods 
      SET ${updateFields.join(', ')}, 
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    values.push(id);
    
    try {
      // If setting as default, unset any existing defaults
      if (updates.isDefault === true) {
        const method = await this.findById(id);
        if (method) {
          await this.unsetDefaultForStudent(method.studentId);
        }
      }
      
      await query(sql, values);
      logger.info(`Payment method ${id} updated`);
      return true;
    } catch (error) {
      logger.error(`Error updating payment method: ${id}`, error);
      throw error;
    }
  }
} 