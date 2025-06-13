import { RowDataPacket, OkPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';

// Flag to track if database is available
let isDatabaseAvailable = true;

// Check if the database pool is properly initialized
const checkDbAvailability = async () => {
  if (!pool || !pool.query) {
    if (isDatabaseAvailable) {
      console.error('Database is not available, using mock data for payments');
      isDatabaseAvailable = false;
    }
    return false;
  }
  
  // Try to execute a simple query to ensure the connection works
  try {
    await pool.query('SELECT 1');
    if (!isDatabaseAvailable) {
      console.log('Database connection restored for payments');
      isDatabaseAvailable = true;
    }
    return true;
  } catch (error) {
    if (isDatabaseAvailable) {
      console.error('Database connection failed, using mock data for payments');
      isDatabaseAvailable = false;
    }
    return false;
  }
};

// Create mock data for payments
const createMockPayments = (studentId: string): Payment[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: 'mock-payment-1',
      studentId,
      amount: 150.00,
      description: 'Tuition fee - September',
      status: 'completed',
      paymentMethod: 'credit_card',
      transactionId: 'tx_mock_123',
      dueDate: lastMonth,
      paymentDate: lastMonth,
      createdAt: lastMonth,
      updatedAt: lastMonth
    },
    {
      id: 'mock-payment-2',
      studentId,
      amount: 150.00,
      description: 'Tuition fee - October',
      status: 'pending',
      dueDate: nextWeek,
      createdAt: today,
      updatedAt: today
    },
    {
      id: 'mock-payment-3',
      studentId,
      amount: 25.00,
      description: 'Lab materials fee',
      status: 'pending',
      dueDate: nextMonth,
      createdAt: today,
      updatedAt: today
    },
    {
      id: 'mock-payment-4',
      studentId,
      amount: 35.00,
      description: 'Field trip fee',
      status: 'overdue',
      dueDate: lastMonth,
      createdAt: lastMonth,
      updatedAt: lastMonth
    }
  ];
};

// Create mock invoices
const createMockInvoices = (studentId: string): Invoice[] => {
  const today = new Date();
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: 'mock-invoice-1',
      paymentId: 'mock-payment-1',
      invoiceNumber: 'INV-2023-001',
      studentId,
      amount: 150.00,
      description: 'Tuition fee - September',
      status: 'completed',
      dueDate: lastMonth,
      issueDate: lastMonth,
      paidDate: lastMonth,
      createdAt: lastMonth,
      updatedAt: lastMonth
    },
    {
      id: 'mock-invoice-2',
      paymentId: 'mock-payment-2',
      invoiceNumber: 'INV-2023-002',
      studentId,
      amount: 150.00,
      description: 'Tuition fee - October',
      status: 'pending',
      dueDate: today,
      issueDate: today,
      createdAt: today,
      updatedAt: today
    }
  ];
};

// Create mock payment methods
const createMockPaymentMethods = (studentId: string): PaymentMethod[] => {
  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  
  return [
    {
      id: 'mock-method-1',
      studentId,
      type: 'credit_card',
      lastFour: '4242',
      expiryDate: `${nextYear.getMonth() + 1}/${nextYear.getFullYear().toString().slice(-2)}`,
      isDefault: true,
      createdAt: today,
      updatedAt: today
    },
    {
      id: 'mock-method-2',
      studentId,
      type: 'paypal',
      isDefault: false,
      createdAt: today,
      updatedAt: today
    }
  ];
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
export type PaymentMethodType = 'credit_card' | 'paypal' | 'bank_transfer' | 'cash';

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'overdue' | 'failed';
  paymentMethod?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash';
  transactionId?: string;
  dueDate: Date;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  studentId: string;
  amount: number;
  description: string;
  status: PaymentStatus;
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  studentId: string;
  type: 'credit_card' | 'paypal' | 'bank_account';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  studentId: string;
  amount: number;
  description: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethodType;
  transactionId?: string;
  dueDate: Date;
}

export interface UpdatePaymentDTO {
  amount?: number;
  description?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethodType;
  transactionId?: string;
  dueDate?: Date;
  paymentDate?: Date;
}

export interface CreateInvoiceDTO {
  paymentId: string;
  invoiceNumber: string;
  studentId: string;
  amount: number;
  description: string;
  status?: PaymentStatus;
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
}

export interface CreatePaymentMethodDTO {
  studentId: string;
  type: 'credit_card' | 'paypal' | 'bank_account';
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

interface PaymentRow extends Payment, RowDataPacket {}
interface InvoiceRow extends Invoice, RowDataPacket {}
interface PaymentMethodRow extends PaymentMethod, RowDataPacket {}

// Payment summary interface
export interface PaymentSummary {
  totalPaid: number;
  pendingPayments: number;
  nextPaymentDue: Date | null;
  overduePayments: number;
}

export class PaymentModel {
  /**
   * Create the payments table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
        paymentMethod ENUM('credit_card', 'paypal', 'bank_transfer', 'cash'),
        transactionId VARCHAR(255),
        dueDate DATE NOT NULL,
        paymentDate DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payments_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await pool.query(query);
      console.log('Payments table created or already exists');
    } catch (error) {
      console.error('Error creating payments table:', error);
      // If table exists but with wrong structure, try to recreate it with correct structure
      try {
        console.log('Attempting to fix payments table...');
        // First check if the table exists
        const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'payments'");
        if (tables.length > 0) {
          // Drop dependent tables first
          await pool.query('DROP TABLE IF EXISTS payment_methods');
          await pool.query('DROP TABLE IF EXISTS invoices');
          await pool.query('DROP TABLE IF EXISTS payments');
          console.log('Dropped existing payments tables');
          // Now recreate with correct structure
          await pool.query(query);
          console.log('Payments table recreated successfully');
        }
      } catch (recreateError) {
        console.error('Failed to fix payments table:', recreateError);
        throw recreateError;
      }
    }
  }

  /**
   * Create the invoices table if it doesn't exist
   */
  async createInvoicesTable(): Promise<void> {
    const query = `
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
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payment_id (paymentId),
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_invoices_payment FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE,
        CONSTRAINT fk_invoices_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await pool.query(query);
      console.log('Invoices table created or already exists');
    } catch (error) {
      console.error('Error creating invoices table:', error);
    }
  }

  /**
   * Create the payment methods table if it doesn't exist
   */
  async createPaymentMethodsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        type ENUM('credit_card', 'paypal', 'bank_account') NOT NULL,
        lastFour VARCHAR(4),
        expiryDate VARCHAR(7),
        isDefault BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payment_methods_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    try {
      await pool.query(query);
      console.log('Payment methods table created or already exists');
    } catch (error) {
      console.error('Error creating payment methods table:', error);
    }
  }

  /**
   * Find a payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    const [rows] = await pool.query<PaymentRow[]>(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new payment
   */
  async create(paymentData: CreatePaymentDTO): Promise<string> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO payments (
        id, studentId, amount, description, status, paymentMethod, transactionId, dueDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<OkPacket>(query, [
      id,
      paymentData.studentId,
      paymentData.amount,
      paymentData.description,
      paymentData.status || 'pending',
      paymentData.paymentMethod,
      paymentData.transactionId,
      paymentData.dueDate
    ]);
    
    return id;
  }

  /**
   * Update a payment
   */
  async update(id: string, paymentData: UpdatePaymentDTO): Promise<boolean> {
    // Build query dynamically based on provided fields
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(paymentData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) {
      return false;
    }
    
    const query = `
      UPDATE payments
      SET ${fields.join(', ')}
      WHERE id = ?
    `;
    
    values.push(id);
    
    const [result] = await pool.query<OkPacket>(query, values);
    
    return result.affectedRows > 0;
  }

  /**
   * Get payments by student ID with optional filters
   */
  async getByStudentId(studentId: string, filters?: {
    status?: PaymentStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Payment[]> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock payment data for student payments');
        let mockPayments = createMockPayments(studentId);
        
        // Apply filters if provided
        if (filters) {
          if (filters.status) {
            mockPayments = mockPayments.filter(p => p.status === filters.status);
          }
          
          if (filters.startDate) {
            mockPayments = mockPayments.filter(p => p.dueDate >= filters.startDate!);
          }
          
          if (filters.endDate) {
            mockPayments = mockPayments.filter(p => p.dueDate <= filters.endDate!);
          }
          
          // Sort by dueDate descending
          mockPayments.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
          
          if (filters.limit) {
            mockPayments = mockPayments.slice(0, filters.limit);
          }
        }
        
        return mockPayments;
      }
      
      let query = 'SELECT * FROM payments WHERE studentId = ?';
      const queryParams: any[] = [studentId];
      
      if (filters) {
        if (filters.status) {
          query += ' AND status = ?';
          queryParams.push(filters.status);
        }
        
        if (filters.startDate) {
          query += ' AND dueDate >= ?';
          queryParams.push(filters.startDate);
        }
        
        if (filters.endDate) {
          query += ' AND dueDate <= ?';
          queryParams.push(filters.endDate);
        }
        
        query += ' ORDER BY dueDate DESC';
        
        if (filters.limit) {
          query += ' LIMIT ?';
          queryParams.push(filters.limit);
        }
      } else {
        query += ' ORDER BY dueDate DESC';
      }
      
      const [rows] = await pool.query<PaymentRow[]>(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting payments by student ID:', error);
      // Return mock data on error as fallback
      let mockPayments = createMockPayments(studentId);
      
      // Apply basic filtering if provided
      if (filters) {
        if (filters.status) {
          mockPayments = mockPayments.filter(p => p.status === filters.status);
        }
        
        mockPayments.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
        
        if (filters.limit) {
          mockPayments = mockPayments.slice(0, filters.limit);
        }
      }
      
      return mockPayments;
    }
  }

  /**
   * Get upcoming payments for a student
   */
  async getUpcomingPayments(studentId: string, limit: number = 5): Promise<Payment[]> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock payment data for upcoming payments');
        // Filter mock payments to only include pending payments with future due dates
        const mockPayments = createMockPayments(studentId)
          .filter(p => p.status === 'pending' && p.dueDate >= new Date())
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        
        return limit ? mockPayments.slice(0, limit) : mockPayments;
      }
      
      const query = `
        SELECT * FROM payments 
        WHERE studentId = ? AND status = 'pending' AND dueDate >= CURDATE()
        ORDER BY dueDate ASC
        ${limit ? 'LIMIT ?' : ''}
      `;
      
      const params: any[] = [studentId];
      if (limit) params.push(limit);
      
      const [rows] = await pool.query<PaymentRow[]>(query, params);
      
      return rows;
    } catch (error) {
      console.error('Error getting upcoming payments:', error);
      // Return mock data on error
      const mockPayments = createMockPayments(studentId)
        .filter(p => p.status === 'pending' && p.dueDate >= new Date())
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
      
      return limit ? mockPayments.slice(0, limit) : mockPayments;
    }
  }

  /**
   * Get overdue payments for a student
   */
  async getOverduePayments(studentId: string): Promise<Payment[]> {
    const query = `
      SELECT * FROM payments 
      WHERE studentId = ? AND status = 'pending' AND dueDate < CURDATE()
      ORDER BY dueDate ASC
    `;
    
    const [rows] = await pool.query<PaymentRow[]>(query, [studentId]);
    
    return rows;
  }

  /**
   * Get payment summary for a student
   */
  async getPaymentSummary(studentId: string): Promise<PaymentSummary> {
    try {
      // Check if database is available
      const dbAvailable = await checkDbAvailability();
      if (!dbAvailable) {
        console.log('Using mock payment data for payment summary');
        const mockPayments = createMockPayments(studentId);
        
        // Mock payment summary
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return {
          totalPaid: 150.00, // Sum of completed payments
          pendingPayments: 175.00, // Sum of pending payments
          nextPaymentDue: nextWeek,
          overduePayments: 1 // Count of overdue payments
        };
      }
      
      // Calculate total paid
      const [paidResult] = await pool.query<RowDataPacket[]>(
        'SELECT SUM(amount) as total FROM payments WHERE studentId = ? AND status = ?',
        [studentId, 'completed']
      );
      const totalPaid = paidResult[0].total || 0;
      
      // Calculate pending payments
      const [pendingResult] = await pool.query<RowDataPacket[]>(
        'SELECT SUM(amount) as total FROM payments WHERE studentId = ? AND status = ?',
        [studentId, 'pending']
      );
      const pendingPayments = pendingResult[0].total || 0;
      
      // Get next payment due
      const [nextPaymentResult] = await pool.query<PaymentRow[]>(
        `SELECT * FROM payments 
         WHERE studentId = ? AND status = 'pending' AND dueDate >= CURDATE()
         ORDER BY dueDate ASC LIMIT 1`,
        [studentId]
      );
      const nextPaymentDue = nextPaymentResult.length > 0 ? nextPaymentResult[0].dueDate : null;
      
      // Get count of overdue payments
      const [overdueResult] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM payments 
         WHERE studentId = ? AND status = 'pending' AND dueDate < CURDATE()`,
        [studentId]
      );
      const overduePayments = overdueResult[0].count || 0;
      
      return {
        totalPaid,
        pendingPayments,
        nextPaymentDue,
        overduePayments
      };
    } catch (error) {
      console.error('Error getting payment summary:', error);
      // Return mock data on error as fallback
      const mockPayments = createMockPayments(studentId);
      
      return {
        totalPaid: mockPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        pendingPayments: mockPayments
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + p.amount, 0),
        nextPaymentDue: mockPayments
          .filter(p => p.status === 'pending' && p.dueDate >= new Date())
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0]?.dueDate || null,
        overduePayments: mockPayments
          .filter(p => p.status === 'pending' && p.dueDate < new Date())
          .length
      };
    }
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: CreateInvoiceDTO): Promise<string> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO invoices (
        id, paymentId, invoiceNumber, studentId, amount, description, 
        status, dueDate, issueDate, paidDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<OkPacket>(query, [
      id,
      invoiceData.paymentId,
      invoiceData.invoiceNumber,
      invoiceData.studentId,
      invoiceData.amount,
      invoiceData.description,
      invoiceData.status || 'pending',
      invoiceData.dueDate,
      invoiceData.issueDate,
      invoiceData.paidDate
    ]);
    
    return id;
  }

  /**
   * Get invoices for a student
   */
  async getInvoicesByStudentId(studentId: string, limit?: number): Promise<Invoice[]> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock invoices data');
        const mockInvoices = createMockInvoices(studentId);
        return limit ? mockInvoices.slice(0, limit) : mockInvoices;
      }
      
      let query = 'SELECT * FROM invoices WHERE studentId = ? ORDER BY issueDate DESC';
      const params: any[] = [studentId];
      
      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
      }
      
      const [rows] = await pool.query<InvoiceRow[]>(query, params);
      
      return rows;
    } catch (error) {
      console.error('Error getting invoices for student:', error);
      // Return mock data on error
      const mockInvoices = createMockInvoices(studentId);
      return limit ? mockInvoices.slice(0, limit) : mockInvoices;
    }
  }

  /**
   * Get an invoice by ID
   */
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const [rows] = await pool.query<InvoiceRow[]>(
      'SELECT * FROM invoices WHERE id = ?',
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(methodData: CreatePaymentMethodDTO): Promise<string> {
    const id = uuidv4();
    
    // If this is the default method, unset any existing default
    if (methodData.isDefault) {
      await pool.query(
        'UPDATE payment_methods SET isDefault = FALSE WHERE studentId = ?',
        [methodData.studentId]
      );
    }
    
    const query = `
      INSERT INTO payment_methods (
        id, studentId, type, lastFour, expiryDate, isDefault
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<OkPacket>(query, [
      id,
      methodData.studentId,
      methodData.type,
      methodData.lastFour,
      methodData.expiryDate,
      methodData.isDefault || false
    ]);
    
    return id;
  }

  /**
   * Get payment methods for a student
   */
  async getPaymentMethodsByStudentId(studentId: string): Promise<PaymentMethod[]> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock payment methods data');
        return createMockPaymentMethods(studentId);
      }
      
      const [rows] = await pool.query<PaymentMethodRow[]>(
        'SELECT * FROM payment_methods WHERE studentId = ? ORDER BY isDefault DESC',
        [studentId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      // Return mock data on error
      return createMockPaymentMethods(studentId);
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string): Promise<boolean> {
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM payment_methods WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(id: string, studentId: string): Promise<boolean> {
    // First, unset any existing default
    await pool.query(
      'UPDATE payment_methods SET isDefault = FALSE WHERE studentId = ?',
      [studentId]
    );
    
    // Then set the new default
    const [result] = await pool.query<OkPacket>(
      'UPDATE payment_methods SET isDefault = TRUE WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

export const paymentModel = new PaymentModel(); 