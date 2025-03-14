/// <reference types="multer" />
import { Router } from 'express';
import multer from 'multer';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Configure multer storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Apply authentication middleware to all assignment routes
router.use(authenticate);

// Assignment CRUD operations
router.get('/', (req, res, next) => {
  assignmentController.getAssignments(req, res).catch(next);
});

// Student-specific routes - Moved before /:id route
router.get('/upcoming', authorize(['student']), (req, res, next) => {
  assignmentController.getUpcomingAssignments(req, res).catch(next);
});

router.get('/my-submissions', authorize(['student']), (req, res, next) => {
  assignmentController.getMySubmissions(req, res).catch(next);
});

// Add the alternative route path that the frontend is trying to use
router.get('/submissions/my', authorize(['student']), (req, res, next) => {
  assignmentController.getMySubmissions(req, res).catch(next);
});

// Teacher-specific routes
router.get('/recent', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.getRecentAssignments(req, res).catch(next);
});

// Course-specific assignment routes
router.get('/course/:courseId', (req, res, next) => {
  assignmentController.getAssignmentsForCourse(req, res).catch(next);
});

// Get assignment by ID
router.get('/:id', (req, res, next) => {
  assignmentController.getAssignment(req, res).catch(next);
});

router.post('/', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.createAssignment(req, res).catch(next);
});

router.put('/:id', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.updateAssignment(req, res).catch(next);
});

router.delete('/:id', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.deleteAssignment(req, res).catch(next);
});

// Submission routes - Updated with file upload handling
router.post('/:assignmentId/submit', authorize(['student']), upload.single('file'), (req, res, next) => {
  assignmentController.submitAssignment(req, res).catch(next);
});

router.post('/submissions/:submissionId/grade', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.gradeSubmission(req, res).catch(next);
});

router.get('/:assignmentId/submissions', authorize(['administrator', 'teacher']), (req, res, next) => {
  assignmentController.getSubmissionsForAssignment(req, res).catch(next);
});

export default router; 