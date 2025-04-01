/// <reference types="multer" />
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { assignmentController } from '../controllers/assignment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Configure multer storage with error handling
const storage = multer.memoryStorage();

// Create multer instance with error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Log file info for debugging
    console.log('Multer processing file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size || 'unknown'
    });
    
    // Accept the file regardless of type, we'll validate in the controller
    cb(null, true);
  }
});

// Multer error handling middleware
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: 'File is too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      error: true,
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
};

// Authentication for all assignment routes
router.use(authenticate);

// Student-specific routes - these need to come before /:id routes to avoid path conflicts
router.get('/upcoming', authorize(['student']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.getUpcomingAssignments(req, res).catch(next);
});

router.get('/my/submissions', (req: Request, res: Response, next: NextFunction) => {
  assignmentController.getMySubmissions(req, res).catch(next);
});

// Add the alternative route path that the frontend is trying to use
router.get('/my-submissions', (req: Request, res: Response, next: NextFunction) => {
  console.log('Redirecting from /my-submissions to /my/submissions');
  assignmentController.getMySubmissions(req, res).catch(next);
});

// Teacher-only assignment CRUD operations
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  assignmentController.getAssignments(req, res).catch(next);
});

router.post('/', authorize(['teacher']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.createAssignment(req, res).catch(next);
});

router.put('/:id', authorize(['teacher']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.updateAssignment(req, res).catch(next);
});

router.delete('/:id', authorize(['teacher']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.deleteAssignment(req, res).catch(next);
});

// Submission routes
router.post('/:id/submit', 
  authorize(['student']), 
  upload.single('file'), 
  handleMulterError,
  (req: Request, res: Response, next: NextFunction) => {
    console.log('Submission request received, passing to controller');
    assignmentController.submitAssignment(req, res).catch(next);
  }
);

router.get('/:id/submissions', authorize(['teacher']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.getSubmissionsForAssignment(req, res).catch(next);
});

// Route for downloading submission files
router.get('/submissions/:submissionId/download', (req: Request, res: Response, next: NextFunction) => {
  assignmentController.downloadSubmissionFile(req, res).catch(next);
});

// Teacher grading route
router.post('/submissions/:submissionId/grade', authorize(['teacher']), (req: Request, res: Response, next: NextFunction) => {
  assignmentController.gradeSubmission(req, res).catch(next);
});

export const assignmentRoutes = router; 