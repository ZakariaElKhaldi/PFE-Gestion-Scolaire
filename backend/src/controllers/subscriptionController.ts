import { Request, Response } from 'express';
import { SubscriptionModel, Subscription } from '../models/Subscription';
import { PaymentMethodModel } from '../models/PaymentMethod';
import { logger } from '../utils/logger';

// Get all subscriptions for a student
export const getStudentSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;
    
    const subscriptions = await SubscriptionModel.findByStudentId(studentId);
    
    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    logger.error(`Error getting subscriptions for student: ${req.params.studentId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscriptions',
      error: (error as Error).message
    });
  }
};

// Get a specific subscription by ID
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    
    const subscription = await SubscriptionModel.findById(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error(`Error getting subscription: ${req.params.subscriptionId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription',
      error: (error as Error).message
    });
  }
};

// Create a new subscription
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      name,
      description,
      amount,
      frequency,
      startDate,
      endDate,
      paymentMethodId,
      status = 'active'
    } = req.body;
    
    // Validate required fields
    if (!studentId || !name || !description || !amount || !frequency || !startDate) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, name, description, amount, frequency, and startDate are required'
      });
      return;
    }
    
    // If payment method is provided, validate it
    if (paymentMethodId) {
      const paymentMethod = await PaymentMethodModel.findById(paymentMethodId);
      
      if (!paymentMethod) {
        res.status(404).json({
          success: false,
          message: 'Payment method not found'
        });
        return;
      }
      
      if (paymentMethod.studentId !== studentId) {
        res.status(403).json({
          success: false,
          message: 'Payment method does not belong to the student'
        });
        return;
      }
    }
    
    // Calculate the next billing date based on the start date and frequency
    const startDateObj = new Date(startDate);
    let nextBillingDate = new Date(startDateObj);
    
    // Create the subscription
    const subscription = await SubscriptionModel.create({
      studentId,
      name,
      description,
      amount,
      frequency,
      startDate: startDateObj,
      endDate: endDate ? new Date(endDate) : undefined,
      nextBillingDate,
      status,
      paymentMethodId
    });
    
    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    logger.error('Error creating subscription', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: (error as Error).message
    });
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required'
      });
      return;
    }
    
    const subscription = await SubscriptionModel.findById(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    await SubscriptionModel.updateStatus(subscriptionId, status);
    
    res.status(200).json({
      success: true,
      message: `Subscription status updated to ${status}`
    });
  } catch (error) {
    logger.error(`Error updating subscription status: ${req.params.subscriptionId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription status',
      error: (error as Error).message
    });
  }
};

// Cancel a subscription
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { endDate } = req.body;
    
    const subscription = await SubscriptionModel.findById(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    await SubscriptionModel.cancel(subscriptionId, endDate ? new Date(endDate) : undefined);
    
    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    logger.error(`Error cancelling subscription: ${req.params.subscriptionId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: (error as Error).message
    });
  }
};

// Update subscription payment method
export const updateSubscriptionPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
      return;
    }
    
    const subscription = await SubscriptionModel.findById(subscriptionId);
    
    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
      return;
    }
    
    const paymentMethod = await PaymentMethodModel.findById(paymentMethodId);
    
    if (!paymentMethod) {
      res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
      return;
    }
    
    if (paymentMethod.studentId !== subscription.studentId) {
      res.status(403).json({
        success: false,
        message: 'Payment method does not belong to the student'
      });
      return;
    }
    
    await SubscriptionModel.updatePaymentMethod(subscriptionId, paymentMethodId);
    
    res.status(200).json({
      success: true,
      message: 'Subscription payment method updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating subscription payment method: ${req.params.subscriptionId}`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription payment method',
      error: (error as Error).message
    });
  }
};

// Get all active subscriptions (admin only)
export const getActiveSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const subscriptions = await SubscriptionModel.getActiveSubscriptions();
    
    res.status(200).json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    logger.error('Error getting active subscriptions', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active subscriptions',
      error: (error as Error).message
    });
  }
};

// Process subscription renewals (admin only)
export const processSubscriptionRenewals = async (req: Request, res: Response): Promise<void> => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    
    const subscriptions = await SubscriptionModel.getSubscriptionsDueForRenewal(date);
    
    if (subscriptions.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No subscriptions due for renewal',
        count: 0
      });
      return;
    }
    
    const results = [];
    
    for (const subscription of subscriptions) {
      try {
        await SubscriptionModel.processRenewal(subscription);
        results.push({
          id: subscription.id,
          status: 'success'
        });
      } catch (error) {
        results.push({
          id: subscription.id,
          status: 'failed',
          error: (error as Error).message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Subscription renewals processed',
      count: subscriptions.length,
      results
    });
  } catch (error) {
    logger.error('Error processing subscription renewals', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process subscription renewals',
      error: (error as Error).message
    });
  }
}; 