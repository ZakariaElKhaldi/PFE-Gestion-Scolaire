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
  },
  fileFilter: (req, file, cb) => {
    // Log file information for debugging
    console.log('Multer processing file:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    // Accept all file types, validate later in controller
    cb(null, true);
  }
});

// Apply authentication middleware to all teacher routes
router.use(authenticate);
router.use(authorize(['teacher']));

// Handle multer error
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    return res.status(400).json({
      error: true,
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
};

// Dashboard route for teachers
router.get('/dashboard-stats', teacherController.getDashboardStats);

// Feedback route
router.get('/received-feedback', teacherController.getReceivedFeedback);

// Assignments routes
router.get('/assignments', teacherController.getTeacherAssignments);

// Log requests to the assignments endpoint
router.use('/assignments', (req, res, next) => {
  console.log(`[TEACHER ROUTES] ${req.method} request to /assignments`, {
    body: req.body,
    files: req.file ? 'Has file' : 'No file',
    user: req.user?.id
  });
  next();
});

router.post('/assignments', upload.single('file'), handleMulterError, teacherController.createTeacherAssignment);

// Students and courses
router.get('/students', teacherController.getStudents);
router.get('/courses', teacherController.getCourses);
router.get('/schedule/:day', teacherController.getScheduleByDay);

// Submissions
router.get('/assignments/:assignmentId/submissions', teacherController.getAssignmentSubmissions);
router.post('/submissions/:submissionId/grade', teacherController.gradeSubmission);

export default router; 