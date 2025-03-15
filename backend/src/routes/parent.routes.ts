import { Router } from 'express';
import { parentController } from '../controllers/parent.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Ensure the user is a parent
router.use(authorize(['parent']));

/**
 * @route   GET /api/parent/children
 * @desc    Get all children of a parent
 * @access  Private (parent)
 */
router.get('/children', parentController.getChildren);

/**
 * @route   GET /api/parent/children/attendance
 * @desc    Get attendance records for all children of a parent
 * @access  Private (parent)
 */
router.get('/children/attendance', parentController.getChildrenAttendance);

/**
 * @route   GET /api/parent/child/:childId/attendance
 * @desc    Get attendance records for a specific child
 * @access  Private (parent)
 */
router.get('/child/:childId/attendance', parentController.getChildAttendance);

/**
 * @route   GET /api/parent/children/attendance/stats
 * @desc    Get attendance statistics for all children of a parent
 * @access  Private (parent)
 */
router.get('/children/attendance/stats', parentController.getChildrenAttendanceStats);

/**
 * @route   GET /api/parent/payments
 * @desc    Get payment information for all children of a parent
 * @access  Private (parent)
 */
router.get('/payments', parentController.getPayments);

/**
 * @route   POST /api/parent/payments/:paymentId/pay
 * @desc    Make a payment for a specific payment
 * @access  Private (parent)
 */
router.post('/payments/:paymentId/pay', parentController.makePayment);

/**
 * @route   GET /api/parent/documents
 * @desc    Get documents for a parent's children
 * @access  Private (parent)
 */
router.get('/documents', parentController.getDocuments);

/**
 * @route   GET /api/parent/documents/:documentId/download
 * @desc    Download a document
 * @access  Private (parent)
 */
router.get('/documents/:documentId/download', parentController.downloadDocument);

/**
 * @route   POST /api/parent/documents/:documentId/sign
 * @desc    Sign a document
 * @access  Private (parent)
 */
router.post('/documents/:documentId/sign', parentController.signDocument);

/**
 * @route   GET /api/parent/feedback
 * @desc    Get feedback messages for a parent's children
 * @access  Private (parent)
 */
router.get('/feedback', parentController.getFeedback);

/**
 * @route   GET /api/parent/feedback/:feedbackId/responses
 * @desc    Get responses for a specific feedback message
 * @access  Private (parent)
 */
router.get('/feedback/:feedbackId/responses', parentController.getFeedbackResponses);

/**
 * @route   POST /api/parent/feedback/:feedbackId/respond
 * @desc    Respond to a feedback message
 * @access  Private (parent)
 */
router.post('/feedback/:feedbackId/respond', parentController.respondToFeedback);

/**
 * @route   PUT /api/parent/feedback/:feedbackId/read
 * @desc    Mark a feedback message as read
 * @access  Private (parent)
 */
router.put('/feedback/:feedbackId/read', parentController.markFeedbackAsRead);

export default router; 