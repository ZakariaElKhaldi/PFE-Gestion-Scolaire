import { Router } from 'express';
import { parentVerificationController } from '../controllers/parent-verification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (no authentication required)
router.get('/relationship/:token', (req, res, next) => {
  parentVerificationController.getRelationshipByToken(req, res)
    .catch(next);
});

router.post('/register-and-verify', (req, res, next) => {
  parentVerificationController.registerAndVerify(req, res)
    .catch(next);
});

router.put('/verify/:token', (req, res, next) => {
  parentVerificationController.verifyRelationship(req, res)
    .catch(next);
});

router.put('/reject/:token', (req, res, next) => {
  parentVerificationController.rejectRelationship(req, res)
    .catch(next);
});

// Protected routes (authentication required)
router.post('/request', authenticate, (req, res, next) => {
  parentVerificationController.createRelationshipRequest(req, res)
    .catch(next);
});

router.get('/children', authenticate, (req, res, next) => {
  parentVerificationController.getChildren(req, res)
    .catch(next);
});

router.post('/resend-verification/:relationshipId', authenticate, (req, res, next) => {
  parentVerificationController.resendVerificationEmail(req, res)
    .catch(next);
});

// Create a student-initiated relationship request
router.post('/student-initiated', (req, res, next) => {
  parentVerificationController.createStudentInitiatedRelationship(req, res)
    .catch(next);
});

// Get pending relationships for parent
router.get('/pending', authenticate, (req, res, next) => {
  parentVerificationController.getPendingRelationships(req, res)
    .catch(next);
});

export default router; 