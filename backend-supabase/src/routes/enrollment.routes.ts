import { Router } from 'express';
import { enrollmentController } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Enroll a student in a course (admin or teacher only)
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  enrollmentController.enroll
);

// Get all enrollments for a course (admin or teacher only)
router.get(
  '/course/:courseId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  enrollmentController.getCourseEnrollments
);

// Get enrollment count for a course (public)
router.get(
  '/course/:courseId/count',
  enrollmentController.getEnrollmentCount
);

// Get all enrollments for a specific student (admin, teacher, or the student themselves)
router.get(
  '/student/:studentId',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER, UserRole.STUDENT]),
  enrollmentController.getStudentEnrollments
);

// Get all enrollments for the authenticated student
router.get(
  '/my-enrollments',
  authenticate,
  authorize([UserRole.STUDENT]),
  enrollmentController.getStudentEnrollments
);

// Get enrollment details
router.get(
  '/:id',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER, UserRole.STUDENT]),
  enrollmentController.getEnrollment
);

// Update enrollment (admin or teacher only)
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER]),
  enrollmentController.updateEnrollment
);

// Drop enrollment (admin, teacher, or the enrolled student)
router.put(
  '/:id/drop',
  authenticate,
  authorize([UserRole.ADMINISTRATOR, UserRole.TEACHER, UserRole.STUDENT]),
  enrollmentController.dropEnrollment
);

// Delete enrollment (admin only)
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMINISTRATOR]),
  enrollmentController.deleteEnrollment
);

export default router; 