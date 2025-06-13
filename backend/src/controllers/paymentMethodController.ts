import { Request, Response } from 'express';
import { PaymentMethodModel, PaymentMethod } from '../models/PaymentMethod';
import { logger } from '../utils/logger';

// Get all payment methods for a student
export const getStudentPaymentMethods = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const paymentMethods = await PaymentMethodModel.findByStudentId(studentId);
    
    res.status(200).json({
      success: true,
      data: paymentMethods,
      count: paymentMethods.length
    });
  } catch (error) {
    logger.error(`Error getting payment methods for student: ${req.params.studentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment methods',
      error: (error as Error).message
    });
  }
};

// Get a specific payment method by ID
export const getPaymentMethodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params;
    
    const paymentMethod = await PaymentMethodModel.findById(methodId);
    
    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: paymentMethod
    });
  } catch (error) {
    logger.error(`Error getting payment method: ${req.params.methodId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment method',
      error: (error as Error).message
    });
  }
};

// Create a new payment method
export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      type,
      provider,
      token,
      lastFour,
      expiryDate,
      cardBrand,
      isDefault = false,
      billingDetails
    } = req.body;
    
    // Validate required fields
    if (!studentId || !type || !provider) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, type, and provider are required'
      });
      return;
    }
    
    const paymentMethod = await PaymentMethodModel.create({
      studentId,
      type,
      provider,
      token,
      lastFour,
      expiryDate,
      cardBrand,
      isDefault,
      billingDetails
    });
    
    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: paymentMethod
    });
  } catch (error) {
    logger.error('Error creating payment method', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment method',
      error: (error as Error).message
    });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params;
    const {
      type,
      provider,
      token,
      lastFour,
      expiryDate,
      cardBrand,
      isDefault,
      billingDetails
    } = req.body;
    
    const paymentMethod = await PaymentMethodModel.findById(methodId);
    
    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
      return;
    }
    
    // Update the payment method
    await PaymentMethodModel.update(methodId, {
      type,
      provider,
      token,
      lastFour,
      expiryDate,
      cardBrand,
      isDefault,
      billingDetails
    });
    
    // Get the updated payment method
    const updatedMethod = await PaymentMethodModel.findById(methodId);
    
    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: updatedMethod
    });
  } catch (error) {
    logger.error(`Error updating payment method: ${req.params.methodId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: (error as Error).message
    });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params;
    
    const paymentMethod = await PaymentMethodModel.findById(methodId);
    
    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
      return;
    }
    
    await PaymentMethodModel.delete(methodId);
    
    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting payment method: ${req.params.methodId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment method',
      error: (error as Error).message
    });
  }
};

// Set a payment method as default
export const setDefaultPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { methodId } = req.params;
    
    const paymentMethod = await PaymentMethodModel.findById(methodId);
    
    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
      return;
    }
    
    await PaymentMethodModel.setDefault(methodId);
    
    res.status(200).json({
      success: true,
      message: 'Payment method set as default successfully'
    });
  } catch (error) {
    logger.error(`Error setting default payment method: ${req.params.methodId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default payment method',
      error: (error as Error).message
    });
  }
}; 