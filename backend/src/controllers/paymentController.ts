import { Request, Response } from 'express';
import { PaymentModel, Payment } from '../models/Payment';
import { PaymentMethodModel } from '../models/PaymentMethod';
import { InvoiceModel } from '../models/Invoice';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Get all payments (admin only)
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const payments = await PaymentModel.getAll(limit, offset);
    
    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length,
      limit,
      offset
    });
  } catch (error) {
    logger.error('Error getting all payments', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payments',
      error: (error as Error).message
    });
  }
};

// Get payments for a specific student
export const getStudentPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const payments = await PaymentModel.findByStudentId(studentId);
    
    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    logger.error(`Error getting payments for student: ${req.params.studentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student payments',
      error: (error as Error).message
    });
  }
};

// Get a specific payment by ID
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error(`Error getting payment: ${req.params.paymentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment',
      error: (error as Error).message
    });
  }
};

// Create a new payment
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      amount,
      description,
      status = 'pending',
      paymentMethod,
      paymentGateway = 'manual',
      dueDate,
      paymentDate
    } = req.body;
    
    // Validate required fields
    if (!studentId || !amount || !description || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, amount, description, and dueDate are required'
      });
      return;
    }
    
    const payment = await PaymentModel.create({
      studentId,
      amount,
      description,
      status,
      paymentMethod,
      paymentGateway,
      dueDate: new Date(dueDate),
      paymentDate: paymentDate ? new Date(paymentDate) : undefined
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    logger.error('Error creating payment', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: (error as Error).message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { status, paymentDate } = req.body;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    await PaymentModel.updateStatus(
      paymentId, 
      status, 
      paymentDate ? new Date(paymentDate) : undefined
    );
    
    // If payment is completed, also update the corresponding invoice if it exists
    if (status === 'completed') {
      const invoice = await InvoiceModel.findByPaymentId(paymentId);
      if (invoice) {
        await InvoiceModel.updateStatus(
          invoice.id, 
          'completed', 
          paymentDate ? new Date(paymentDate) : new Date()
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`
    });
  } catch (error) {
    logger.error(`Error updating payment status: ${req.params.paymentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: (error as Error).message
    });
  }
};

// Process payment with a payment gateway (e.g., PayPal, Stripe)
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const { paymentMethodId, gateway = 'manual' } = req.body;
    
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    // If payment method is provided, validate it
    let paymentMethod = null;
    if (paymentMethodId) {
      paymentMethod = await PaymentMethodModel.findById(paymentMethodId);
      
      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
        return;
      }
      
      if (paymentMethod.studentId !== payment.studentId) {
        res.status(403).json({
          success: false,
          message: 'Payment method does not belong to the student'
        });
        return;
      }
    }
    
    // Mock payment processing - in a real app, you would integrate with the payment gateway API
    // For now, we'll simulate a successful payment
    const transactionId = uuidv4();
    const gatewayResponse = {
      transactionId,
      status: 'success',
      timestamp: new Date().toISOString(),
      gateway
    };
    
    // Update payment details with transaction info
    await PaymentModel.updatePaymentDetails(
      paymentId,
      transactionId,
      gatewayResponse,
      'completed'
    );
    
    // Update the invoice if it exists
    const invoice = await InvoiceModel.findByPaymentId(paymentId);
    if (invoice) {
      await InvoiceModel.updateStatus(invoice.id, 'completed', new Date());
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      transactionId,
      gatewayResponse
    });
  } catch (error) {
    logger.error(`Error processing payment: ${req.params.paymentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: (error as Error).message
    });
  }
};

// Get overdue payments (admin only)
export const getOverduePayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const overduePayments = await PaymentModel.getOverduePayments();
    
    res.status(200).json({
      success: true,
      data: overduePayments,
      count: overduePayments.length
    });
  } catch (error) {
    logger.error('Error getting overdue payments', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve overdue payments',
      error: (error as Error).message
    });
  }
};

// Generate invoice for a payment
export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentId } = req.params;
    
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    // Check if an invoice already exists for this payment
    const existingInvoice = await InvoiceModel.findByPaymentId(paymentId);
    
    if (existingInvoice) {
      res.status(200).json({
        success: true,
        message: 'Invoice already exists for this payment',
        data: existingInvoice
      });
      return;
    }
    
    // Create a new invoice
    const invoice = await InvoiceModel.create({
      paymentId,
      studentId: payment.studentId,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      dueDate: payment.dueDate,
      issueDate: new Date(),
      paidDate: payment.paymentDate
    });
    
    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice
    });
  } catch (error) {
    logger.error(`Error generating invoice for payment: ${req.params.paymentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: (error as Error).message
    });
  }
}; 