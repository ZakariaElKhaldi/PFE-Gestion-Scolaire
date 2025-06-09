import { API_BASE_URL } from '../config/api-config';
import axios from 'axios';

// Create an API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  studentId?: string;
}

export interface ProcessPaymentRequest {
  amount: number;
  description: string;
  paymentMethod: string;
  studentId?: string;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  dueDate?: string;
}

export interface AddPaymentMethodRequest {
  type: 'credit_card' | 'paypal' | 'bank_account';
  lastFour?: string;
  expiryDate?: string;
  isDefault?: boolean;
}

export interface PaymentProcessResult {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  transactionId: string;
  message: string;
}

export interface StripePaymentIntentRequest {
  amount: number;
  description: string;
  studentId?: string;
  currency?: string;
}

export interface StripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export const paymentService = {
  /**
   * Get payment summary for a student
   * @param studentId - The ID of the student
   */
  async getPaymentSummary(studentId: string): Promise<PaymentSummary> {
    const { data } = await apiClient.get<PaymentSummary>(`/payments/summary/${studentId}`);
    return data;
  },
  
  /**
   * Get all payments
   */
  async getPayments(): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>('/payments');
    return data;
  },
  
  /**
   * Get all payments for a student
   * @param studentId - The ID of the student
   */
  async getStudentPayments(studentId: string): Promise<Payment[]> {
    const { data } = await apiClient.get<Payment[]>(`/payments/student/${studentId}`);
    return data;
  },
  
  /**
   * Get all invoices for a student
   * @param studentId - The ID of the student
   */
  async getInvoices(studentId: string): Promise<Invoice[]> {
    const { data } = await apiClient.get<Invoice[]>(`/payments/invoices/${studentId}`);
    return data;
  },
  
  /**
   * Get all payment methods for a student
   * @param studentId - The ID of the student
   */
  async getPaymentMethods(studentId: string): Promise<PaymentMethod[]> {
    const { data } = await apiClient.get<PaymentMethod[]>(`/payments/methods/${studentId}`);
    return data;
  },
  
  /**
   * Process a payment
   * @param paymentData - The payment data
   */
  async processPayment(paymentData: Partial<Payment>): Promise<PaymentProcessResult> {
    const { data } = await apiClient.post<PaymentProcessResult>('/payments/process', paymentData);
    return data;
  },

  /**
   * Get a specific payment by ID
   */
  async getPayment(id: string): Promise<Payment> {
    const { data } = await apiClient.get<Payment>(`/payments/${id}`);
    return data;
  },

  /**
   * Create a new payment
   */
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const { data } = await apiClient.post<Payment>('/payments', paymentData);
    return data;
  },

  /**
   * Update a payment
   */
  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const { data } = await apiClient.put<Payment>(`/payments/${id}`, paymentData);
    return data;
  },

  /**
   * Delete a payment
   */
  async deletePayment(id: string): Promise<void> {
    await apiClient.delete(`/payments/${id}`);
  },

  /**
   * Create a Stripe payment intent
   */
  async createPaymentIntent(intentData: StripePaymentIntentRequest): Promise<StripePaymentIntentResponse> {
    const { data } = await apiClient.post<StripePaymentIntentResponse>(
      '/payments/create-payment-intent', 
      intentData
    );
    return data;
  },

  /**
   * Add a payment method
   */
  async addPaymentMethod(methodData: AddPaymentMethodRequest): Promise<PaymentMethod> {
    const { data } = await apiClient.post<PaymentMethod>('/payments/methods', methodData);
    return data;
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    await apiClient.delete(`/payments/methods/${methodId}`);
  },

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(methodId: string): Promise<PaymentMethod> {
    const { data } = await apiClient.patch<PaymentMethod>(`/payments/methods/${methodId}/default`, {});
    return data;
  },

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(`/payments/invoices/detail/${invoiceId}`);
    return data;
  },

  /**
   * Download an invoice PDF
   */
  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/payments/invoices/download/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to download invoice');
    }
    
    return await response.blob();
  },
}; 