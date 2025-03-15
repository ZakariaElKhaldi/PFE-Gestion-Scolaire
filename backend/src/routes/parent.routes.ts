import { Router, Request, Response, NextFunction } from 'express';
import { parentController } from '../controllers/parent.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Improved asyncHandler with logging
const asyncHandler = (fn: Function, routeName: string) => async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[PARENT-ROUTE] ${routeName} - Request received`, {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  
  try {
    const result = await Promise.resolve(fn(req, res, next));
    console.log(`[PARENT-ROUTE] ${routeName} - Request completed successfully`);
    return result;
  } catch (error) {
    console.error(`[PARENT-ROUTE] ${routeName} - Error:`, error);
    next(error);
  }
};

// Apply authentication middleware to all routes
router.use(authenticate);

// Ensure the user is a parent
router.use(authorize(['parent']));

/**
 * @route   GET /api/parent/children
 * @desc    Get all children of a parent
 * @access  Private (parent)
 */
router.get('/children', asyncHandler(parentController.getChildren, 'GET /children'));

/**
 * @route   GET /api/parent/children/attendance
 * @desc    Get attendance records for all children of a parent
 * @access  Private (parent)
 */
router.get('/children/attendance', asyncHandler(parentController.getChildrenAttendance, 'GET /children/attendance'));

/**
 * @route   GET /api/parent/child/:childId/attendance
 * @desc    Get attendance records for a specific child
 * @access  Private (parent)
 */
router.get('/child/:childId/attendance', asyncHandler(parentController.getChildAttendance, 'GET /child/:childId/attendance'));

/**
 * @route   GET /api/parent/children/attendance/stats
 * @desc    Get attendance statistics for all children of a parent
 * @access  Private (parent)
 */
router.get('/children/attendance/stats', asyncHandler(parentController.getChildrenAttendanceStats, 'GET /children/attendance/stats'));

/**
 * @route   GET /api/parent/payments
 * @desc    Get payment information for all children of a parent
 * @access  Private (parent)
 */
router.get('/payments', asyncHandler(parentController.getPayments, 'GET /payments'));

/**
 * @route   POST /api/parent/payments/:paymentId/pay
 * @desc    Make a payment for a specific payment
 * @access  Private (parent)
 */
router.post('/payments/:paymentId/pay', asyncHandler(parentController.makePayment, 'POST /payments/:paymentId/pay'));

/**
 * @route   GET /api/parent/documents
 * @desc    Get documents for a parent's children
 * @access  Private (parent)
 */
router.get('/documents', asyncHandler(parentController.getDocuments, 'GET /documents'));

/**
 * @route   GET /api/parent/documents/:documentId/download
 * @desc    Download a document
 * @access  Private (parent)
 */
router.get('/documents/:documentId/download', asyncHandler(parentController.downloadDocument, 'GET /documents/:documentId/download'));

/**
 * @route   POST /api/parent/documents/:documentId/sign
 * @desc    Sign a document
 * @access  Private (parent)
 */
router.post('/documents/:documentId/sign', asyncHandler(parentController.signDocument, 'POST /documents/:documentId/sign'));

/**
 * @route   GET /api/parent/feedback
 * @desc    Get feedback messages for a parent's children
 * @access  Private (parent)
 */
router.get('/feedback', asyncHandler(parentController.getFeedback, 'GET /feedback'));

/**
 * @route   GET /api/parent/feedback/:feedbackId/responses
 * @desc    Get responses for a specific feedback message
 * @access  Private (parent)
 */
router.get('/feedback/:feedbackId/responses', asyncHandler(parentController.getFeedbackResponses, 'GET /feedback/:feedbackId/responses'));

/**
 * @route   POST /api/parent/feedback/:feedbackId/respond
 * @desc    Respond to a feedback message
 * @access  Private (parent)
 */
router.post('/feedback/:feedbackId/respond', asyncHandler(parentController.respondToFeedback, 'POST /feedback/:feedbackId/respond'));

/**
 * @route   PUT /api/parent/feedback/:feedbackId/read
 * @desc    Mark a feedback message as read
 * @access  Private (parent)
 */
router.put('/feedback/:feedbackId/read', asyncHandler(parentController.markFeedbackAsRead, 'PUT /feedback/:feedbackId/read'));

export default router; 