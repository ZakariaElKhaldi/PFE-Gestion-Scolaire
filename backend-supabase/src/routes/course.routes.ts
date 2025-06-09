import { Router } from 'express';
import { courseController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Public routes - allow anyone to view courses
router.get('/', asyncHandler(courseController.getAllCourses.bind(courseController)));
router.get('/:id', asyncHandler(courseController.getCourseById.bind(courseController)));

// Protected routes - require authentication
router.use(authenticate);

// Create course - admin only
router.post(
  '/',
  authorize([UserRole.ADMINISTRATOR]),
  asyncHandler(courseController.createCourse.bind(courseController))
);

// Update course - admin or teacher (with restrictions)
router.put(
  '/:id',
  asyncHandler(courseController.updateCourse.bind(courseController))
);

// Delete course - admin only
router.delete(
  '/:id',
  authorize([UserRole.ADMINISTRATOR]),
  asyncHandler(courseController.deleteCourse.bind(courseController))
);

export default router; 