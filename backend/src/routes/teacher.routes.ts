import { Router } from 'express';
import { teacherController } from '../controllers/teacher.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// Configure file upload middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Apply authentication middleware to all teacher routes
router.use(authenticate);
router.use(authorize(['teacher']));

// Dashboard and basic info routes
router.get('/dashboard-stats', teacherController.getDashboardStats);
router.get('/schedule/:day', teacherController.getScheduleByDay);
router.get('/students', teacherController.getStudents);
router.get('/courses', teacherController.getCourses);

// Assignment management
router.get('/assignments', teacherController.getTeacherAssignments);
router.post('/assignments', teacherController.createTeacherAssignment);
router.get('/assignments/:assignmentId/submissions', teacherController.getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', teacherController.gradeSubmission);

export default router; 