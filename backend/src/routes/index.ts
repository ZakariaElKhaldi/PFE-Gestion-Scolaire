import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import courseRoutes from './course.routes';
import classRoutes from './class.routes';
import { assignmentRoutes } from './assignment.routes';
import departmentRoutes from './department.routes';
import studentRoutes from './student.routes';
import paymentRoutes from './payment.routes';
import materialRoutes from './material.routes';
import feedbackRoutes from './feedback.routes';
import certificateRoutes from './certificate.routes';
import teacherRoutes from './teacher.routes';
import parentRoutes from './parent.routes';
import parentVerificationRoutes from './parent-verification.routes';
import settingsRoutes from './settings.routes';
import messageRoutes from './message.routes';
import express from 'express';

const router = Router();

// Add a simple health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Course routes
router.use('/courses', courseRoutes);

// Class routes
router.use('/classes', classRoutes);

// Assignment routes
router.use('/assignments', assignmentRoutes);

// Department routes
router.use('/departments', departmentRoutes);

// Student routes
router.use('/students', studentRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Material routes
router.use('/materials', materialRoutes);

// Feedback routes
router.use('/feedback', feedbackRoutes);

// Certificate routes
router.use('/certificates', certificateRoutes);

// Teacher routes
router.use('/teachers', teacherRoutes);

// Parent routes
router.use('/parent', parentRoutes);

// Parent verification routes
router.use('/parent-verification', parentVerificationRoutes);

// Settings routes
router.use('/settings', settingsRoutes);

// Message routes
router.use('/messages', messageRoutes);

export default router; 