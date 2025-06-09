import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { paymentService } from '../services/payment-service';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API responses
const mockPaymentSummary = {
  totalPaid: 500,
  pendingPayments: 200,
  nextPaymentDue: '2023-07-01',
  overduePayments: 0,
};

const mockPayments = [
  {
    id: 'payment-1',
    studentId: 'student-1',
    amount: 150.00,
    description: 'Tuition fee - Fall Semester',
    status: 'completed',
    paymentMethod: 'credit_card',
    transactionId: 'tx_123',
    dueDate: '2023-01-15',
    paymentDate: '2023-01-10',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-10',
  },
  {
    id: 'payment-2',
    studentId: 'student-1',
    amount: 200.00,
    description: 'Tuition fee - Spring Semester',
    status: 'pending',
    dueDate: '2023-07-15',
    createdAt: '2023-06-01',
    updatedAt: '2023-06-01',
  },
];

const mockInvoices = [
  {
    id: 'invoice-1',
    paymentId: 'payment-1',
    invoiceNumber: 'INV-2023-001',
    studentId: 'student-1',
    amount: 150.00,
    description: 'Tuition fee - Fall Semester',
    status: 'completed',
    dueDate: '2023-01-15',
    issueDate: '2023-01-01',
    paidDate: '2023-01-10',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-10',
  },
];

const mockPaymentMethods = [
  {
    id: 'method-1',
    studentId: 'student-1',
    type: 'credit_card',
    lastFour: '4242',
    expiryDate: '12/25',
    isDefault: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
];

// Setup MSW server
const server = setupServer(
  // GET payment summary
  http.get('http://localhost:3001/api/payments/summary/:studentId', () => {
    return HttpResponse.json(mockPaymentSummary);
  }),
  
  // GET payments
  http.get('http://localhost:3001/api/payments', () => {
    return HttpResponse.json(mockPayments);
  }),
  
  // GET student payments
  http.get('http://localhost:3001/api/payments/student/:studentId', () => {
    return HttpResponse.json(mockPayments);
  }),
  
  // GET invoices
  http.get('http://localhost:3001/api/payments/invoices/:studentId', () => {
    return HttpResponse.json(mockInvoices);
  }),
  
  // GET payment methods
  http.get('http://localhost:3001/api/payments/methods/:studentId', () => {
    return HttpResponse.json(mockPaymentMethods);
  }),
  
  // POST process payment
  http.post('http://localhost:3001/api/payments/process', async () => {
    return HttpResponse.json({
      paymentId: 'payment-3',
      invoiceId: 'invoice-2',
      invoiceNumber: 'INV-2023-002',
      transactionId: 'tx_456',
      message: 'Payment processed successfully',
    });
  })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Payment Service Integration', () => {
  it('should fetch payment summary', async () => {
    const result = await paymentService.getPaymentSummary('student-1');
    expect(result).toEqual(mockPaymentSummary);
  });
  
  it('should fetch payments', async () => {
    const result = await paymentService.getPayments();
    expect(result).toEqual(mockPayments);
  });
  
  it('should fetch student payments', async () => {
    const result = await paymentService.getStudentPayments('student-1');
    expect(result).toEqual(mockPayments);
  });
  
  it('should fetch invoices', async () => {
    const result = await paymentService.getInvoices('student-1');
    expect(result).toEqual(mockInvoices);
  });
  
  it('should fetch payment methods', async () => {
    const result = await paymentService.getPaymentMethods('student-1');
    expect(result).toEqual(mockPaymentMethods);
  });
  
  it('should process a payment', async () => {
    const paymentData = {
      amount: 100,
      description: 'Test payment',
      paymentMethod: 'credit_card',
      studentId: 'student-1',
    };
    
    const result = await paymentService.processPayment(paymentData);
    
    expect(result).toHaveProperty('paymentId', 'payment-3');
    expect(result).toHaveProperty('invoiceId', 'invoice-2');
    expect(result).toHaveProperty('transactionId', 'tx_456');
  });
}); 