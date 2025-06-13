import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { logger } from '../utils/logger';
import { Payment } from './Payment';

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  studentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceModel {
  static async create(invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const id = uuidv4();
    // Generate a unique invoice number (format: INV-YYYYMMDD-XXXX)
    const invoiceNumber = await this.generateInvoiceNumber();
    
    const sql = `
      INSERT INTO invoices (
        id, 
        paymentId, 
        invoiceNumber, 
        studentId, 
        amount, 
        description, 
        status, 
        dueDate, 
        issueDate, 
        paidDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id,
      invoice.paymentId,
      invoiceNumber,
      invoice.studentId,
      invoice.amount,
      invoice.description,
      invoice.status,
      invoice.dueDate,
      invoice.issueDate,
      invoice.paidDate || null
    ];

    try {
      await query(sql, params);
      logger.info(`Invoice created with ID: ${id}, Number: ${invoiceNumber}`);
      
      const newInvoice = await this.findById(id);
      if (!newInvoice) {
        throw new Error(`Failed to retrieve created invoice with ID: ${id}`);
      }
      return newInvoice;
    } catch (error) {
      logger.error('Error creating invoice', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<Invoice | null> {
    const sql = `SELECT * FROM invoices WHERE id = ?`;
    try {
      const invoices = await query<Invoice>(sql, [id]);
      return invoices.length > 0 ? invoices[0] : null;
    } catch (error) {
      logger.error(`Error finding invoice with ID: ${id}`, error);
      throw error;
    }
  }

  static async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    const sql = `SELECT * FROM invoices WHERE invoiceNumber = ?`;
    try {
      const invoices = await query<Invoice>(sql, [invoiceNumber]);
      return invoices.length > 0 ? invoices[0] : null;
    } catch (error) {
      logger.error(`Error finding invoice with number: ${invoiceNumber}`, error);
      throw error;
    }
  }

  static async findByStudentId(studentId: string): Promise<Invoice[]> {
    const sql = `SELECT * FROM invoices WHERE studentId = ? ORDER BY issueDate DESC`;
    try {
      return await query<Invoice>(sql, [studentId]);
    } catch (error) {
      logger.error(`Error finding invoices for student: ${studentId}`, error);
      throw error;
    }
  }

  static async findByPaymentId(paymentId: string): Promise<Invoice | null> {
    const sql = `SELECT * FROM invoices WHERE paymentId = ?`;
    try {
      const invoices = await query<Invoice>(sql, [paymentId]);
      return invoices.length > 0 ? invoices[0] : null;
    } catch (error) {
      logger.error(`Error finding invoice for payment: ${paymentId}`, error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: Invoice['status'], paidDate?: Date): Promise<boolean> {
    const sql = `
      UPDATE invoices 
      SET status = ?, 
          paidDate = ?,
          updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    try {
      await query(sql, [status, paidDate || null, id]);
      logger.info(`Invoice ${id} status updated to ${status}`);
      return true;
    } catch (error) {
      logger.error(`Error updating invoice status: ${id}`, error);
      throw error;
    }
  }

  static async getAll(limit: number = 100, offset: number = 0): Promise<Invoice[]> {
    const sql = `
      SELECT * FROM invoices 
      ORDER BY issueDate DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      return await query<Invoice>(sql, [limit, offset]);
    } catch (error) {
      logger.error('Error getting all invoices', error);
      throw error;
    }
  }

  static async getByStatus(status: Invoice['status'], limit: number = 100, offset: number = 0): Promise<Invoice[]> {
    const sql = `
      SELECT * FROM invoices 
      WHERE status = ?
      ORDER BY issueDate DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      return await query<Invoice>(sql, [status, limit, offset]);
    } catch (error) {
      logger.error(`Error getting invoices with status: ${status}`, error);
      throw error;
    }
  }

  static async getOverdueInvoices(): Promise<Invoice[]> {
    const sql = `
      SELECT * FROM invoices 
      WHERE status = 'pending' 
      AND dueDate < CURDATE()
      ORDER BY dueDate ASC
    `;
    
    try {
      return await query<Invoice>(sql, []);
    } catch (error) {
      logger.error('Error getting overdue invoices', error);
      throw error;
    }
  }

  private static async generateInvoiceNumber(): Promise<string> {
    // Format: INV-YYYYMMDD-XXXX where XXXX is a sequential number
    const today = new Date();
    const dateStr = today.getFullYear() +
                   String(today.getMonth() + 1).padStart(2, '0') +
                   String(today.getDate()).padStart(2, '0');
    
    // Get the last invoice number for today to increment
    const sql = `
      SELECT invoiceNumber 
      FROM invoices 
      WHERE invoiceNumber LIKE ? 
      ORDER BY invoiceNumber DESC 
      LIMIT 1
    `;
    
    try {
      const prefix = `INV-${dateStr}-`;
      const results = await query<{invoiceNumber: string}>(sql, [`${prefix}%`]);
      
      let sequence = 1;
      if (results.length > 0) {
        const lastNumber = results[0].invoiceNumber;
        const lastSequence = parseInt(lastNumber.split('-')[2], 10);
        sequence = lastSequence + 1;
      }
      
      return `${prefix}${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      logger.error('Error generating invoice number', error);
      // Fallback to a timestamp-based number if there's an error
      return `INV-${dateStr}-${Date.now().toString().slice(-4)}`;
    }
  }
} 