import { Request, Response } from 'express';
import { paymentModel, PaymentInput, PaymentMethod, PaymentStatus } from '../models/payment.model';
import { enrollmentModel } from '../models/enrollment.model';
import { courseModel } from '../models/course.model';
import { userModel } from '../models/user.model';
import { logger } from '../utils/logger';
import { UserRole } from '../types/auth';
import Stripe from 'stripe';
import { config } from '../config/config';

// Initialize Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class PaymentController {
  /**
   * Create a payment intent for Stripe
   */
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, enrollmentId, currency = 'USD' } = req.body;
      const studentId = req.user?.userId;
      
      if (!studentId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }
      
      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }
      
      // Get course to check price
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      if (!course.price) {
        res.status(400).json({ error: 'Course does not have a price set' });
        return;
      }
      
      // Create payment input
      const paymentInput: PaymentInput = {
        studentId,
        courseId,
        enrollmentId,
        amount: course.price,
        currency,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        description: `Payment for course: ${course.name}`
      };
      
      // Create payment intent
      const result = await paymentModel.createStripePaymentIntent(paymentInput);
      if (!result) {
        res.status(500).json({ error: 'Failed to create payment intent' });
        return;
      }
      
      res.status(200).json({
        clientSecret: result.clientSecret,
        paymentId: result.paymentId,
        amount: course.price,
        currency
      });
    } catch (error) {
      logger.error('Error in createPaymentIntent:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
      
      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update payment status to completed
          await paymentModel.updatePaymentStatusFromStripe(
            paymentIntent.id,
            PaymentStatus.COMPLETED,
            paymentIntent.charges?.data[0]?.receipt_url
          );
          
          // If there's an enrollment ID in the metadata, update enrollment status
          if (paymentIntent.metadata?.enrollmentId) {
            await enrollmentModel.update(paymentIntent.metadata.enrollmentId, {});
          }
          
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update payment status to failed
          await paymentModel.updatePaymentStatusFromStripe(
            failedPaymentIntent.id,
            PaymentStatus.FAILED
          );
          
          break;
        default:
          logger.info(`Unhandled event type: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Error handling Stripe webhook:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }

  /**
   * Create a manual payment (admin only)
   */
  async createManualPayment(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, courseId, enrollmentId, amount, currency, paymentMethod, description } = req.body;
      
      // Validate input
      if (!studentId || !courseId || !amount || !currency || !paymentMethod) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }
      
      // Check if student exists
      const student = await userModel.findById(studentId);
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      // Check if course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      // Create payment
      const paymentInput: PaymentInput = {
        studentId,
        courseId,
        enrollmentId,
        amount,
        currency,
        paymentMethod: paymentMethod as PaymentMethod,
        description: description || `Manual payment for course: ${course.name}`
      };
      
      const payment = await paymentModel.createManualPayment(paymentInput);
      if (!payment) {
        res.status(500).json({ error: 'Failed to create payment' });
        return;
      }
      
      res.status(201).json(payment);
    } catch (error) {
      logger.error('Error in createManualPayment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validate input
      if (!id || !status) {
        res.status(400).json({ error: 'Payment ID and status are required' });
        return;
      }
      
      // Check if payment exists
      const payment = await paymentModel.findById(id);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      
      // Update payment status
      const updatedPayment = await paymentModel.updatePaymentStatus(id, status as PaymentStatus);
      if (!updatedPayment) {
        res.status(500).json({ error: 'Failed to update payment status' });
        return;
      }
      
      res.status(200).json(updatedPayment);
    } catch (error) {
      logger.error('Error in updatePaymentStatus:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get payment details
   */
  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({ error: 'Payment ID is required' });
        return;
      }
      
      // Get payment with details
      const payment = await paymentModel.findById(id, true);
      if (!payment) {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      
      // Check permissions - only admins, or the student who made the payment can view payment details
      if (req.user?.role !== UserRole.ADMINISTRATOR && req.user?.userId !== payment.studentId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      res.status(200).json(payment);
    } catch (error) {
      logger.error('Error in getPayment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all payments for a student
   */
  async getStudentPayments(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || req.user?.userId;
      
      if (!studentId) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
      }
      
      // Check permissions - only admins or the student themselves can view their payments
      if (req.user?.role !== UserRole.ADMINISTRATOR && req.user?.userId !== studentId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // Get payments
      const payments = await paymentModel.findByStudentId(studentId);
      
      res.status(200).json(payments);
    } catch (error) {
      logger.error('Error in getStudentPayments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all payments for a course (admin only)
   */
  async getCoursePayments(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      
      // Validate input
      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }
      
      // Check if course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      // Get payments
      const payments = await paymentModel.findByCourseId(courseId);
      
      res.status(200).json(payments);
    } catch (error) {
      logger.error('Error in getCoursePayments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get payment statistics (admin only)
   */
  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await paymentModel.getPaymentStats();
      
      res.status(200).json(stats);
    } catch (error) {
      logger.error('Error in getPaymentStats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const paymentController = new PaymentController(); 