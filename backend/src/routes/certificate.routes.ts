import express from 'express';
import { certificateController } from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

// Public routes
router.get('/verify/:verificationId', certificateController.verifyCertificate);
router.get('/public-download/:id', certificateController.publicDownloadCertificate);

// Test route for generating a certificate with QR code (accessible to anyone for testing)
router.post('/test-generate', certificateController.testGenerateCertificate);

// Public route to generate PDFs for all certificates (for testing)
router.post('/public-generate-pdfs', certificateController.publicGeneratePdfs);

// Student routes
router.get('/student', authenticate, authorize(['student']), certificateController.getStudentCertificates);
router.get('/student/:id', authenticate, authorize(['student', 'administrator']), certificateController.getCertificate);
router.get('/download/:id', authenticate, certificateController.downloadCertificate);

// Admin routes
router.get('/admin/student/:studentId', authenticate, authorize(['administrator']), certificateController.getStudentCertificatesById);
router.post('/admin', authenticate, authorize(['administrator']), certificateController.createCertificate);
router.put('/admin/:id', authenticate, authorize(['administrator']), certificateController.updateCertificate);
router.delete('/admin/:id', authenticate, authorize(['administrator']), certificateController.deleteCertificate);

// Course completion certificate generation
router.post('/generate/course-completion', authenticate, authorize(['administrator']), certificateController.generateCourseCompletionCertificate);

// Generate PDFs for all certificates
router.post('/generate/all-pdfs', authenticate, authorize(['administrator']), certificateController.generateAllCertificatePdfs);

export default router; 