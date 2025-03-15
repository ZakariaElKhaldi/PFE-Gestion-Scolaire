import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate);

// Dashboard data
router.get('/dashboard', adminController.getDashboardData);

// User statistics
router.get('/users/stats', adminController.getUserStats);

// System statistics
router.get('/system/stats', adminController.getSystemStats);

// Financial overview
router.get('/financial/overview', adminController.getFinancialOverview);

export const adminRoutes = router; 