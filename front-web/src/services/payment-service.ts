import { apiClient } from '../lib/api-client';

export interface PaymentSummary {
  totalPaid: number;
  pendingPayments: number;
  nextPaymentDue: Date | null;
  overduePayments: number;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  paymentMethod?: string;
  transactionId?: string;
  dueDate: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNumber: string;
  studentId: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  dueDate: string;
  issueDate: string;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  studentId: string;
  type: 'credit_card' | 'paypal' | 'bank_account';
  provider?: string;
  token?: string;
  lastFour?: string;
  expiryDate?: string;
  cardBrand?: string;
  isDefault: boolean;
  billingDetails?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
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

export interface PaymentResponse {
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string;
  transactionId: string;
  message: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  paymentMethodId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  description?: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  paymentMethodId?: string;
}

class PaymentService {
  /**
   * Get payment summary for the current student
   */
  async getPaymentSummary(): Promise<PaymentSummary> {
    try {
      const response = await apiClient.get<{ data: PaymentSummary }>('/payments/summary');
      
      // Process the response data
      const summaryData = response.data.data || response.data;
      
      // Ensure numeric values
      return {
        totalPaid: typeof summaryData.totalPaid === 'string' ? parseFloat(summaryData.totalPaid) : (summaryData.totalPaid || 0),
        pendingPayments: typeof summaryData.pendingPayments === 'string' ? parseFloat(summaryData.pendingPayments) : (summaryData.pendingPayments || 0),
        nextPaymentDue: summaryData.nextPaymentDue ? new Date(summaryData.nextPaymentDue) : null,
        overduePayments: typeof summaryData.overduePayments === 'string' ? parseInt(summaryData.overduePayments) : (summaryData.overduePayments || 0)
      };
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      // Return mock data if the API call fails
      return this.getMockPaymentSummary();
    }
  }
  
  /**
   * Get mock payment summary data when API fails
   */
  private getMockPaymentSummary(): PaymentSummary {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return {
      totalPaid: 300.00,
      pendingPayments: 175.00,
      nextPaymentDue: nextWeek,
      overduePayments: 1
    };
  }

  /**
   * Get payment history for the current student
   */
  async getPaymentHistory(filters?: PaymentFilters): Promise<Payment[]> {
    try {
      // Build URL with query parameters
      let url = '/payments/history';
      
      if (filters) {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
      }
      
      const response = await apiClient.get<{ data?: Payment[]; payments?: Payment[] }>(url);
      
      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data.payments && Array.isArray(response.data.payments)) {
        return response.data.payments;
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      // Return mock data on error
      return this.getMockPaymentHistory();
    }
  }
  
  /**
   * Get mock payment history data when API fails
   */
  private getMockPaymentHistory(): Payment[] {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    return [
      {
        id: 'mock-payment-1',
        studentId: 'mock-student-1',
        amount: 150.00,
        description: 'Tuition fee - Fall Semester',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'tx_mock_123',
        dueDate: lastMonth.toISOString(),
        paymentDate: lastMonth.toISOString(),
        createdAt: lastMonth.toISOString(),
        updatedAt: lastMonth.toISOString()
      },
      {
        id: 'mock-payment-2',
        studentId: 'mock-student-1',
        amount: 75.00,
        description: 'Lab Materials',
        status: 'completed',
        paymentMethod: 'credit_card',
        transactionId: 'tx_mock_124',
        dueDate: twoMonthsAgo.toISOString(),
        paymentDate: twoMonthsAgo.toISOString(),
        createdAt: twoMonthsAgo.toISOString(),
        updatedAt: twoMonthsAgo.toISOString()
      },
      {
        id: 'mock-payment-3',
        studentId: 'mock-student-1',
        amount: 150.00,
        description: 'Tuition fee - Current Semester',
        status: 'pending',
        dueDate: today.toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      }
    ];
  }

  /**
   * Get upcoming payments for the current student
   */
  async getUpcomingPayments(limit?: number): Promise<Payment[]> {
    try {
      let url = '/payments/upcoming';
      
      if (limit) {
        url += `?limit=${limit}`;
      }
      
      const response = await apiClient.get<{ data: Payment[] }>(url);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching upcoming payments:', error);
      // Return mock data on error
      return this.getMockUpcomingPayments();
    }
  }
  
  /**
   * Get mock upcoming payments data when API fails
   */
  private getMockUpcomingPayments(): Payment[] {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    return [
      {
        id: 'mock-upcoming-1',
        studentId: 'mock-student-1',
        amount: 150.00,
        description: 'Tuition fee - Current Semester',
        status: 'pending',
        dueDate: nextWeek.toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: 'mock-upcoming-2',
        studentId: 'mock-student-1',
        amount: 25.00,
        description: 'Lab Materials Fee',
        status: 'pending',
        dueDate: nextMonth.toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      }
    ];
  }

  /**
   * Process a payment
   */
  async processPayment(paymentData: ProcessPaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<PaymentResponse>('/payments/process', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  /**
   * Get invoices for the current student
   */
  async getInvoices(limit?: number): Promise<Invoice[]> {
    try {
      let url = '/payments/invoices';
      
      if (limit) {
        url += `?limit=${limit}`;
      }
      
      const response = await apiClient.get<{ data?: Invoice[]; invoices?: Invoice[] }>(url);
      
      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data.invoices && Array.isArray(response.data.invoices)) {
        return response.data.invoices;
      }
      return [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Return mock data on error
      return this.getMockInvoices();
    }
  }

  /**
   * Get a specific invoice
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<{ data: Invoice }>(`/payments/invoices/${invoiceId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      // Return mock data on error
      const mockInvoices = this.getMockInvoices();
      const mockInvoice = mockInvoices.find(inv => inv.id === invoiceId) || mockInvoices[0];
      return mockInvoice;
    }
  }

  /**
   * Download an invoice as PDF
   */
  async downloadInvoice(invoiceId: string): Promise<Blob> {
    try {
      // Use a direct fetch for blob data
      const token = localStorage.getItem('auth_token');
      const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
      const url = `${baseURL}/payments/invoices/${invoiceId}/download`;
      
      console.log(`Downloading invoice from: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      console.log(`Response status: ${response.status}, ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from server:', errorText);
        throw new Error(`Failed to download invoice: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      // Check if the response is actually a PDF
      if (contentType && contentType.includes('application/pdf')) {
        return await response.blob();
      } else {
        console.error('Unexpected content type:', contentType);
        throw new Error('Server did not return a PDF file');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  /**
   * Get all subscriptions for the current student
   */
  async getSubscriptions(): Promise<Subscription[]> {
    try {
      // Use the studentId from the current user context
      const response = await apiClient.get<{ data: Subscription[] }>('/payments/student/me/subscriptions');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return [];
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(subscriptionData: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      const response = await apiClient.post<{ data: Subscription }>('/payments/subscriptions', subscriptionData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/payments/subscriptions/${subscriptionId}/cancel`, {});
      return {
        success: true,
        message: response.data.message || 'Subscription cancelled successfully'
      };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription payment method
   */
  async updateSubscriptionPaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/payments/subscriptions/${subscriptionId}/payment-method`, { paymentMethodId });
      return {
        success: true,
        message: response.data.message || 'Subscription payment method updated successfully'
      };
    } catch (error) {
      console.error('Error updating subscription payment method:', error);
      throw error;
    }
  }

  /**
   * Get payment methods for the current student
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      interface MethodsResponse {
        data?: {
          methods?: PaymentMethod[];
        };
        methods?: PaymentMethod[];
      }
      
      const response = await apiClient.get<MethodsResponse>('/payments/methods');
      
      // Handle different response formats
      if (response.data.data && Array.isArray(response.data.data.methods)) {
        return response.data.data.methods;
      } else if (response.data.methods && Array.isArray(response.data.methods)) {
        return response.data.methods;
      }
      return [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Return mock data on error
      return this.getMockPaymentMethods();
    }
  }
  
  /**
   * Get mock payment methods data when API fails
   */
  private getMockPaymentMethods(): PaymentMethod[] {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    
    return [
      {
        id: 'mock-method-1',
        studentId: 'mock-student-1',
        type: 'credit_card',
        lastFour: '4242',
        expiryDate: `${nextYear.getMonth() + 1}/${nextYear.getFullYear().toString().slice(-2)}`,
        isDefault: true,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: 'mock-method-2',
        studentId: 'mock-student-1',
        type: 'paypal',
        isDefault: false,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      }
    ];
  }

  /**
   * Add a new payment method
   */
  async addPaymentMethod(methodData: AddPaymentMethodRequest): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post<{ data: PaymentMethod }>('/payments/methods', methodData);
      return response.data.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<void> {
    try {
      await apiClient.delete(`/payments/methods/${methodId}`);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(methodId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<{ message: string }>(`/payments/methods/${methodId}/default`, {});
      return { message: response.data.message || 'Default payment method updated' };
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }

  /**
   * Get mock invoices data when API fails
   */
  private getMockInvoices(): Invoice[] {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    return [
      {
        id: 'mock-invoice-1',
        paymentId: 'mock-payment-1',
        invoiceNumber: 'INV-2023-001',
        studentId: 'mock-student-1',
        amount: 150.00,
        description: 'Tuition fee - Fall Semester',
        status: 'completed',
        dueDate: lastMonth.toISOString(),
        issueDate: lastMonth.toISOString(),
        paidDate: lastMonth.toISOString(),
        createdAt: lastMonth.toISOString(),
        updatedAt: lastMonth.toISOString()
      },
      {
        id: 'mock-invoice-2',
        paymentId: 'mock-payment-2',
        invoiceNumber: 'INV-2023-002',
        studentId: 'mock-student-1',
        amount: 75.00,
        description: 'Lab Materials',
        status: 'completed',
        dueDate: twoMonthsAgo.toISOString(),
        issueDate: twoMonthsAgo.toISOString(),
        paidDate: twoMonthsAgo.toISOString(),
        createdAt: twoMonthsAgo.toISOString(),
        updatedAt: twoMonthsAgo.toISOString()
      },
      {
        id: 'mock-invoice-3',
        paymentId: 'mock-payment-3',
        invoiceNumber: 'INV-2023-003',
        studentId: 'mock-student-1',
        amount: 150.00,
        description: 'Tuition fee - Current Semester',
        status: 'pending',
        dueDate: today.toISOString(),
        issueDate: today.toISOString(),
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      }
    ];
  }
}

export const paymentService = new PaymentService(); 