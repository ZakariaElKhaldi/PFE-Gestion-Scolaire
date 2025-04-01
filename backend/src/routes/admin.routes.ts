import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { systemController } from '../controllers/system.controller';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();

// Apply auth middleware to all admin routes
router.use(authenticate);
router.use(isAdmin);

// Dashboard data
router.get('/dashboard', adminController.getDashboardData);

// User statistics
router.get('/users/stats', adminController.getUserStats);

// System statistics
router.get('/system/stats', adminController.getSystemStats);

// Financial overview
router.get('/financial/overview', adminController.getFinancialOverview);

/**
 * @swagger
 * /api/admin/system/metrics:
 *   get:
 *     summary: Get system metrics
 *     description: Retrieve system resource usage metrics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       500:
 *         description: Server error
 */
router.get('/system/metrics', (req, res, next) => {
  systemController.getSystemMetrics(req, res).catch(next);
});

export const adminRoutes = router; 