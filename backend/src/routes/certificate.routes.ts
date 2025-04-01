import express, { Request, Response, NextFunction } from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all certificate routes
router.use(authenticate);

// Student routes - for viewing their own certificates
router.get('/student', authorize(['student']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.getStudentCertificates(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/student/:id', authorize(['student']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.getCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/download/:id', authorize(['student', 'administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.downloadCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Public verification route - no authentication required
router.get('/verify/:verificationId', (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.verifyCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Admin routes - for managing certificates
router.get('/admin/student/:studentId', authorize(['administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.getStudentCertificatesById(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post('/admin', authorize(['administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.createCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put('/admin/:id', authorize(['administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.updateCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.delete('/admin/:id', authorize(['administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.deleteCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Course-related certificate generation
router.post('/generate/course-completion', authorize(['administrator']), (req: Request, res: Response, next: NextFunction) => {
  try {
    certificateController.generateCourseCompletionCertificate(req, res, next);
  } catch (error) {
    next(error);
  }
});

export default router; 