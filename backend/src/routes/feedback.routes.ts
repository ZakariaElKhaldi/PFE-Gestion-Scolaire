import express, { RequestHandler } from 'express';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Routes for students
router.get('/student', authorize(['student', 'admin']), feedbackController.getStudentFeedback as RequestHandler);
router.post('/submit', authorize(['student']), feedbackController.submitFeedback as RequestHandler);
router.put('/:feedbackId', authorize(['student', 'admin']), feedbackController.updateFeedback as RequestHandler);
router.delete('/:feedbackId', authorize(['student', 'admin']), feedbackController.deleteFeedback as RequestHandler);

// Routes for teachers
router.get('/teacher', authorize(['teacher', 'admin']), feedbackController.getTeacherFeedback as RequestHandler);
router.post('/:feedbackId/respond', authorize(['teacher', 'admin']), feedbackController.addTeacherResponse as RequestHandler);

// Routes for courses
router.get('/course/:courseId', feedbackController.getCourseFeedback as RequestHandler);
router.get('/course/:courseId/stats', feedbackController.getCourseFeedbackStats as RequestHandler);

// Log all registered routes for debugging purposes
console.log('Feedback routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`- ${r.route.stack[0].method.toUpperCase()} /api/feedback${r.route.path}`);
  }
});

export default router; 