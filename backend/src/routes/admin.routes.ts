import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Apply role middleware to ensure only admins can access these routes
router.use(roleMiddleware(['admin']));

// Dashboard data
router.get('/dashboard', adminController.getDashboardData);

// User statistics
router.get('/user-stats', adminController.getUserStats);

// System statistics
router.get('/system-stats', adminController.getSystemStats);

// Financial overview
router.get('/financial-overview', adminController.getFinancialOverview);

export default router; 