import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { validateBody } from '../middlewares/validation.middleware';
import { signUpSchema, signInSchema } from '../schemas/auth.schema';

const router = Router();

// Public routes
router.post('/register', validateBody(signUpSchema), asyncHandler(authController.register.bind(authController)));
router.post('/login', validateBody(signInSchema), asyncHandler(authController.login.bind(authController)));
router.get('/verify-email', asyncHandler(authController.verifyEmail.bind(authController)));
router.post('/forgot-password', asyncHandler(authController.forgotPassword.bind(authController)));
router.post('/reset-password', asyncHandler(authController.resetPassword.bind(authController)));
router.get('/verify-parent/:invitationId?/:studentId?', asyncHandler(authController.verifyParentConnection.bind(authController)));

// Protected routes
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser.bind(authController)));

export default router; 