import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import Stripe from 'stripe';
import { config } from '../config/config';

// Initialize Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer'
}

export interface Payment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  paypalTransactionId?: string;
  description?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInput {
  studentId: string;
  courseId: string;
  enrollmentId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
}

export interface PaymentWithDetails extends Payment {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: string;
    name: string;
    code: string;
  };
}

class PaymentModel {
  /**
   * Find payment by id
   */
  async findById(id: string, includeDetails = false): Promise<Payment | PaymentWithDetails | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error('Error finding payment by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      const payment: Payment = {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status as PaymentStatus,
        paymentMethod: data.payment_method as PaymentMethod,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        paypalTransactionId: data.paypal_transaction_id,
        description: data.description,
        receiptUrl: data.receipt_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // If details are not requested, return the basic payment
      if (!includeDetails) {
        return payment;
      }
      
      // Get student details
      let student;
      const { data: studentData, error: studentError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('id', data.student_id)
        .single();
      
      if (!studentError && studentData) {
        student = {
          id: studentData.id,
          firstName: studentData.first_name,
          lastName: studentData.last_name,
          email: studentData.email
        };
      }
      
      // Get course details
      let course;
      const { data: courseData, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('id, name, code')
        .eq('id', data.course_id)
        .single();
      
      if (!courseError && courseData) {
        course = {
          id: courseData.id,
          name: courseData.name,
          code: courseData.code
        };
      }
      
      return {
        ...payment,
        student,
        course
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Find payments by student id
   */
  async findByStudentId(studentId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error finding payments by student id:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        courseId: item.course_id,
        enrollmentId: item.enrollment_id,
        amount: item.amount,
        currency: item.currency,
        status: item.status as PaymentStatus,
        paymentMethod: item.payment_method as PaymentMethod,
        stripePaymentIntentId: item.stripe_payment_intent_id,
        paypalTransactionId: item.paypal_transaction_id,
        description: item.description,
        receiptUrl: item.receipt_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findByStudentId:', error);
      return [];
    }
  }

  /**
   * Find payments by course id
   */
  async findByCourseId(courseId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error finding payments by course id:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        courseId: item.course_id,
        enrollmentId: item.enrollment_id,
        amount: item.amount,
        currency: item.currency,
        status: item.status as PaymentStatus,
        paymentMethod: item.payment_method as PaymentMethod,
        stripePaymentIntentId: item.stripe_payment_intent_id,
        paypalTransactionId: item.paypal_transaction_id,
        description: item.description,
        receiptUrl: item.receipt_url,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findByCourseId:', error);
      return [];
    }
  }

  /**
   * Create a payment intent with Stripe
   */
  async createStripePaymentIntent(paymentData: PaymentInput): Promise<{ clientSecret: string; paymentId: string } | null> {
    try {
      // Get student email for Stripe customer
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', paymentData.studentId)
        .single();
      
      if (userError || !userData) {
        logger.error('Error finding user for payment:', userError);
        return null;
      }
      
      // Get course name for payment description
      const { data: courseData, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('name')
        .eq('id', paymentData.courseId)
        .single();
      
      if (courseError || !courseData) {
        logger.error('Error finding course for payment:', courseError);
        return null;
      }
      
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Stripe requires amount in cents
        currency: paymentData.currency.toLowerCase(),
        metadata: {
          courseId: paymentData.courseId,
          studentId: paymentData.studentId,
          enrollmentId: paymentData.enrollmentId || ''
        },
        receipt_email: userData.email,
        description: paymentData.description || `Payment for course: ${courseData.name}`
      });
      
      // Create a payment record in the database
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('payments')
        .insert({
          id,
          student_id: paymentData.studentId,
          course_id: paymentData.courseId,
          enrollment_id: paymentData.enrollmentId || null,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: PaymentStatus.PENDING,
          payment_method: PaymentMethod.CREDIT_CARD,
          stripe_payment_intent_id: paymentIntent.id,
          description: paymentData.description || `Payment for course: ${courseData.name}`,
          created_at: now,
          updated_at: now
        })
        .select('id')
        .single();
      
      if (error) {
        logger.error('Error creating payment record:', error);
        return null;
      }
      
      return {
        clientSecret: paymentIntent.client_secret as string,
        paymentId: data.id
      };
    } catch (error) {
      logger.error('Error in createStripePaymentIntent:', error);
      return null;
    }
  }

  /**
   * Update payment status based on Stripe webhook event
   */
  async updatePaymentStatusFromStripe(paymentIntentId: string, status: PaymentStatus, receiptUrl?: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({
          status,
          receipt_url: receiptUrl,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId)
        .select('id, enrollment_id')
        .single();
      
      if (error) {
        logger.error('Error updating payment status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in updatePaymentStatusFromStripe:', error);
      return false;
    }
  }

  /**
   * Create a manual payment record (for bank transfers or other manual methods)
   */
  async createManualPayment(paymentData: PaymentInput): Promise<Payment | null> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('payments')
        .insert({
          id,
          student_id: paymentData.studentId,
          course_id: paymentData.courseId,
          enrollment_id: paymentData.enrollmentId || null,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: PaymentStatus.PENDING,
          payment_method: paymentData.paymentMethod,
          description: paymentData.description,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating manual payment:', error);
        return null;
      }
      
      return {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status as PaymentStatus,
        paymentMethod: data.payment_method as PaymentMethod,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        paypalTransactionId: data.paypal_transaction_id,
        description: data.description,
        receiptUrl: data.receipt_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in createManualPayment:', error);
      return null;
    }
  }

  /**
   * Update payment status manually (for bank transfers or admin actions)
   */
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating payment status manually:', error);
        return null;
      }
      
      return {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        amount: data.amount,
        currency: data.currency,
        status: data.status as PaymentStatus,
        paymentMethod: data.payment_method as PaymentMethod,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        paypalTransactionId: data.paypal_transaction_id,
        description: data.description,
        receiptUrl: data.receipt_url,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in updatePaymentStatus:', error);
      return null;
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(): Promise<{ totalAmount: number; completedPayments: number; pendingPayments: number }> {
    try {
      // Get total amount of completed payments
      const { data: completedData, error: completedError } = await supabaseAdmin
        .from('payments')
        .select('amount')
        .eq('status', PaymentStatus.COMPLETED);
      
      if (completedError) {
        logger.error('Error getting completed payments:', completedError);
        return { totalAmount: 0, completedPayments: 0, pendingPayments: 0 };
      }
      
      // Get count of pending payments
      const { count: pendingCount, error: pendingError } = await supabaseAdmin
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', PaymentStatus.PENDING);
      
      if (pendingError) {
        logger.error('Error getting pending payment count:', pendingError);
        return { totalAmount: 0, completedPayments: 0, pendingPayments: 0 };
      }
      
      const totalAmount = completedData.reduce((sum, payment) => sum + payment.amount, 0);
      
      return {
        totalAmount,
        completedPayments: completedData.length,
        pendingPayments: pendingCount || 0
      };
    } catch (error) {
      logger.error('Error in getPaymentStats:', error);
      return { totalAmount: 0, completedPayments: 0, pendingPayments: 0 };
    }
  }
}

export const paymentModel = new PaymentModel(); 