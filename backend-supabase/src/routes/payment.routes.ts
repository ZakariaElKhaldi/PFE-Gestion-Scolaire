import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';
import express from 'express';

const router = Router();

// Create a payment intent for Stripe (student)
router.post(
  '/create-payment-intent',
  authenticate,
  authorize([UserRole.STUDENT]),
  paymentController.createPaymentIntent
);

// Handle Stripe webhook events (no auth - Stripe calls this endpoint)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

// Create a manual payment (admin only)
router.post(
  '/manual',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  paymentController.createManualPayment
);

// Update payment status (admin only)
router.put(
  '/:id/status',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  paymentController.updatePaymentStatus
);

// Get payment details
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.STUDENT]),
  paymentController.getPayment
);

// Get all payments for a student
router.get(
  '/student/:studentId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  paymentController.getStudentPayments
);

// Get all payments for the authenticated student
router.get(
  '/my-payments',
  authenticate,
  authorize([UserRole.STUDENT]),
  paymentController.getStudentPayments
);

// Get all payments for a course (admin only)
router.get(
  '/course/:courseId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  paymentController.getCoursePayments
);

// Get payment statistics (admin only)
router.get(
  '/stats',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  paymentController.getPaymentStats
);

export default router; 