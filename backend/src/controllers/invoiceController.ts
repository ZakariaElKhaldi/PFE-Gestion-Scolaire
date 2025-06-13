import { Request, Response } from 'express';
import { InvoiceModel, Invoice } from '../models/Invoice';
import { PaymentModel } from '../models/Payment';
import { logger } from '../utils/logger';

// Get all invoices (admin only)
export const getAllInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const invoices = await InvoiceModel.getAll(limit, offset);
    
    res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length,
      limit,
      offset
    });
  } catch (error) {
    logger.error('Error getting all invoices', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoices',
      error: (error as Error).message
    });
  }
};

// Get invoices for a specific student
export const getStudentInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const invoices = await InvoiceModel.findByStudentId(studentId);
    
    res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  } catch (error) {
    logger.error(`Error getting invoices for student: ${req.params.studentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve student invoices',
      error: (error as Error).message
    });
  }
};

// Get a specific invoice by ID
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    
    const invoice = await InvoiceModel.findById(invoiceId);
    
    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error(`Error getting invoice: ${req.params.invoiceId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: (error as Error).message
    });
  }
};

// Get a specific invoice by invoice number
export const getInvoiceByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceNumber } = req.params;
    
    const invoice = await InvoiceModel.findByInvoiceNumber(invoiceNumber);
    
    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    logger.error(`Error getting invoice by number: ${req.params.invoiceNumber}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: (error as Error).message
    });
  }
};

// Create a new invoice
export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      paymentId,
      studentId,
      amount,
      description,
      status = 'pending',
      dueDate,
      issueDate = new Date(),
      paidDate
    } = req.body;
    
    // Validate required fields
    if (!paymentId || !studentId || !amount || !description || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: paymentId, studentId, amount, description, and dueDate are required'
      });
      return;
    }
    
    // Verify that the payment exists
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
      res.status(400).json({
        success: false,
        message: 'An invoice already exists for this payment',
        data: existingInvoice
      });
      return;
    }
    
    const invoice = await InvoiceModel.create({
      paymentId,
      studentId,
      amount,
      description,
      status,
      dueDate: new Date(dueDate),
      issueDate: new Date(issueDate),
      paidDate: paidDate ? new Date(paidDate) : undefined
    });
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    logger.error('Error creating invoice', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: (error as Error).message
    });
  }
};

// Update invoice status
export const updateInvoiceStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const { status, paidDate } = req.body;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    const invoice = await InvoiceModel.findById(invoiceId);
    
    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }
    
    await InvoiceModel.updateStatus(
      invoiceId, 
      status, 
      paidDate ? new Date(paidDate) : undefined
    );
    
    // If invoice is completed, also update the corresponding payment if it exists
    if (status === 'completed') {
      const payment = await PaymentModel.findById(invoice.paymentId);
      if (payment && payment.status !== 'completed') {
        await PaymentModel.updateStatus(
          payment.id, 
          'completed', 
          paidDate ? new Date(paidDate) : new Date()
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Invoice status updated to ${status}`
    });
  } catch (error) {
    logger.error(`Error updating invoice status: ${req.params.invoiceId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice status',
      error: (error as Error).message
    });
  }
};

// Get overdue invoices (admin only)
export const getOverdueInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const overdueInvoices = await InvoiceModel.getOverdueInvoices();
    
    res.status(200).json({
      success: true,
      data: overdueInvoices,
      count: overdueInvoices.length
    });
  } catch (error) {
    logger.error('Error getting overdue invoices', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve overdue invoices',
      error: (error as Error).message
    });
  }
}; 