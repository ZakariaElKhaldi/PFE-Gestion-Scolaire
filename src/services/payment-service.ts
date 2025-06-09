import { API_BASE_URL } from '../config/api-config';

export interface Payment {
  id?: string;
  studentId: string;
  amount: number;
  description: string;
  status?: string;
  paymentMethod?: string;
  transactionId?: string;
  dueDate?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentSummary {
  totalPaid: number;
  pendingPayments: number;
  nextPaymentDue: string;
  overduePayments: number;
}

export interface Invoice {
  id?: string;
  paymentId: string;
  invoiceNumber: string;
  studentId: string;
  amount: number;
  description: string;
  status: string;
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMethod {
  id?: string;
  studentId: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentProcessResult {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  transactionId: string;
  message: string;
}

export const paymentService = {
  /**
   * Get payment summary for a student
   * @param studentId - The ID of the student
   */
  async getPaymentSummary(studentId: string): Promise<PaymentSummary> {
    const response = await fetch(`${API_BASE_URL}/payments/summary/${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payment summary: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get all payments
   */
  async getPayments(): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get all payments for a student
   * @param studentId - The ID of the student
   */
  async getStudentPayments(studentId: string): Promise<Payment[]> {
    const response = await fetch(`${API_BASE_URL}/payments/student/${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student payments: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get all invoices for a student
   * @param studentId - The ID of the student
   */
  async getInvoices(studentId: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get all payment methods for a student
   * @param studentId - The ID of the student
   */
  async getPaymentMethods(studentId: string): Promise<PaymentMethod[]> {
    const response = await fetch(`${API_BASE_URL}/payments/methods/${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch payment methods: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Process a payment
   * @param paymentData - The payment data
   */
  async processPayment(paymentData: Partial<Payment>): Promise<PaymentProcessResult> {
    const response = await fetch(`${API_BASE_URL}/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process payment: ${response.statusText}`);
    }
    
    return response.json();
  },
}; 