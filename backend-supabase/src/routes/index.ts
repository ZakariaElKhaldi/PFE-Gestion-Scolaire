import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import departmentRoutes from './department.routes';
import courseRoutes from './course.routes';
import enrollmentRoutes from './enrollment.routes';
import paymentRoutes from './payment.routes';

const router = Router();

// Register all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);

export default router; 