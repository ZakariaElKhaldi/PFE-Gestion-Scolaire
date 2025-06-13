import express, { RequestHandler } from 'express';
import { paymentController } from '../controllers/payment.controller';
import * as newPaymentController from '../controllers/paymentController';
import * as paymentMethodController from '../controllers/paymentMethodController';
import * as invoiceController from '../controllers/invoiceController';
import * as subscriptionController from '../controllers/subscriptionController';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ---------- EXISTING PAYMENT ROUTES ----------

// Student role required for these routes
router.get('/summary', authorize(['student', 'admin']), paymentController.getPaymentSummary as RequestHandler);
router.get('/history', authorize(['student', 'admin']), paymentController.getPaymentHistory as RequestHandler);
router.get('/upcoming', authorize(['student', 'admin']), paymentController.getUpcomingPayments as RequestHandler);
router.post('/process', authorize(['student', 'admin']), paymentController.processPayment as RequestHandler);
router.get('/invoices', authorize(['student', 'admin']), paymentController.getInvoices as RequestHandler);
router.get('/invoices/:invoiceId', authorize(['student', 'admin']), paymentController.getInvoice as RequestHandler);
router.get('/invoices/:invoiceId/download', authorize(['student', 'admin']), paymentController.downloadInvoice as RequestHandler);
router.get('/methods', authorize(['student', 'admin']), paymentController.getPaymentMethods as RequestHandler);
router.post('/methods', authorize(['student', 'admin']), paymentController.addPaymentMethod as RequestHandler);
router.delete('/methods/:methodId', authorize(['student', 'admin']), paymentController.deletePaymentMethod as RequestHandler);
router.put('/methods/:methodId/default', authorize(['student', 'admin']), paymentController.setDefaultPaymentMethod as RequestHandler);

// ---------- NEW PAYMENT API ROUTES ----------

// New Payment routes
router.get('/all', authorize(['admin']), newPaymentController.getAllPayments);
router.get('/overdue', authorize(['admin']), newPaymentController.getOverduePayments);
router.get('/:paymentId', newPaymentController.getPaymentById);
router.get('/student/:studentId', authorize(['admin', 'student']), newPaymentController.getStudentPayments);
router.post('/', authorize(['admin']), newPaymentController.createPayment);
router.put('/:paymentId/status', authorize(['admin']), newPaymentController.updatePaymentStatus);
router.post('/:paymentId/process-payment', newPaymentController.processPayment);
router.post('/:paymentId/generate-invoice', authorize(['admin']), newPaymentController.generateInvoice);

// New Payment method routes
router.get('/payment-methods/:methodId', paymentMethodController.getPaymentMethodById);
router.get('/student/:studentId/payment-methods', paymentMethodController.getStudentPaymentMethods);
router.post('/payment-methods', paymentMethodController.createPaymentMethod);
router.put('/payment-methods/:methodId', paymentMethodController.updatePaymentMethod);
router.delete('/payment-methods/:methodId', paymentMethodController.deletePaymentMethod);
router.put('/payment-methods/:methodId/default', paymentMethodController.setDefaultPaymentMethod);

// New Invoice routes
router.get('/invoices/all', authorize(['admin']), invoiceController.getAllInvoices);
router.get('/invoices/overdue', authorize(['admin']), invoiceController.getOverdueInvoices);
router.get('/invoices/id/:invoiceId', invoiceController.getInvoiceById);
router.get('/invoices/number/:invoiceNumber', invoiceController.getInvoiceByNumber);
router.get('/student/:studentId/invoices', invoiceController.getStudentInvoices);
router.post('/invoices', authorize(['admin']), invoiceController.createInvoice);
router.put('/invoices/:invoiceId/status', authorize(['admin']), invoiceController.updateInvoiceStatus);

// New Subscription routes
router.get('/subscriptions/active', authorize(['admin']), subscriptionController.getActiveSubscriptions);
router.get('/subscriptions/:subscriptionId', subscriptionController.getSubscriptionById);
router.get('/student/:studentId/subscriptions', subscriptionController.getStudentSubscriptions);
router.post('/subscriptions', subscriptionController.createSubscription);
router.put('/subscriptions/:subscriptionId/status', subscriptionController.updateSubscriptionStatus);
router.put('/subscriptions/:subscriptionId/cancel', subscriptionController.cancelSubscription);
router.put('/subscriptions/:subscriptionId/payment-method', subscriptionController.updateSubscriptionPaymentMethod);
router.post('/subscriptions/process-renewals', authorize(['admin']), subscriptionController.processSubscriptionRenewals);

export default router; 