import { Router, Request, Response } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { UserRole } from '../types/auth';
import multer from 'multer';

// Configure multer for memory storage (needed for Supabase storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const router = Router();

// Public routes - none for users

// Protected routes - require authentication
router.use(authenticate);

// Get current user
router.get('/me', asyncHandler(async (req: Request, res: Response) => {
  req.params.id = req.user!.userId;
  await userController.getUserById(req, res);
}));

// Get all users (admin only)
router.get(
  '/',
  authorize([UserRole.ADMINISTRATOR]),
  asyncHandler(userController.getUsers.bind(userController))
);

// Get user by ID
router.get(
  '/:id',
  asyncHandler(userController.getUserById.bind(userController))
);

// Update user
router.put(
  '/:id',
  asyncHandler(userController.updateUser.bind(userController))
);

// Update password
router.put(
  '/:id/password',
  asyncHandler(userController.updatePassword.bind(userController))
);

// Upload profile picture
router.post(
  '/:id/profile-picture',
  upload.single('profilePicture'),
  asyncHandler(userController.uploadProfilePicture.bind(userController))
);

// Delete user (admin only)
router.delete(
  '/:id',
  authorize([UserRole.ADMINISTRATOR]),
  asyncHandler(userController.deleteUser.bind(userController))
);

export default router; 