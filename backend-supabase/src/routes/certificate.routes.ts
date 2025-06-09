import { Router } from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and image files
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
    }
  }
});

const router = Router();

// Generate a certificate for a completed course enrollment (admin or teacher only)
router.post(
  '/generate',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  certificateController.generateCertificate
);

// Upload certificate file (admin or teacher only)
router.post(
  '/:id/upload',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  upload.single('certificate'),
  certificateController.uploadCertificateFile
);

// Get certificate by ID
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER, UserRole.STUDENT]),
  certificateController.getCertificate
);

// Get all certificates for a student
router.get(
  '/student/:studentId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  certificateController.getStudentCertificates
);

// Get all certificates for the authenticated student
router.get(
  '/my-certificates',
  authenticate,
  authorize([UserRole.STUDENT]),
  certificateController.getStudentCertificates
);

// Get all certificates for a course
router.get(
  '/course/:courseId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  certificateController.getCourseCertificates
);

// Verify certificate by verification code (public)
router.get(
  '/verify/:code',
  certificateController.verifyCertificate
);

// Revoke certificate (admin only)
router.put(
  '/:id/revoke',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  certificateController.revokeCertificate
);

export default router; 