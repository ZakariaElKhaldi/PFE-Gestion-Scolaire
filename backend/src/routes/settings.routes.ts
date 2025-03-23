import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to all settings routes
router.use(authenticate);

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', (req, res, next) => {
  settingsController.getUserSettings(req, res)
    .catch(next);
});

/**
 * @swagger
 * /settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               smsNotifications:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', (req, res, next) => {
  settingsController.updateUserSettings(req, res)
    .catch(next);
});

// Admin-only routes
/**
 * @swagger
 * /settings/system:
 *   get:
 *     summary: Get system settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
router.get('/system', authorize(['administrator']), (req, res, next) => {
  settingsController.getSystemSettings(req, res)
    .catch(next);
});

/**
 * @swagger
 * /settings/system:
 *   put:
 *     summary: Update system settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schoolName:
 *                 type: string
 *               academicYear:
 *                 type: string
 *               timezone:
 *                 type: string
 *               emailNotifications:
 *                 type: boolean
 *               defaultLanguage:
 *                 type: string
 *               maintenanceMode:
 *                 type: boolean
 *               maxStudentsPerClass:
 *                 type: integer
 *               gradingSystem:
 *                 type: string
 *                 enum: [letter, percentage, points]
 *     responses:
 *       200:
 *         description: System settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
router.put('/system', authorize(['administrator']), (req, res, next) => {
  settingsController.updateSystemSettings(req, res)
    .catch(next);
});

/**
 * @swagger
 * /settings/security:
 *   get:
 *     summary: Get security settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
router.get('/security', authorize(['administrator']), (req, res, next) => {
  settingsController.getSecuritySettings(req, res)
    .catch(next);
});

/**
 * @swagger
 * /settings/security:
 *   put:
 *     summary: Update security settings (admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requireTwoFactor:
 *                 type: boolean
 *               passwordExpiryDays:
 *                 type: integer
 *               sessionTimeout:
 *                 type: integer
 *               allowedIpRanges:
 *                 type: array
 *                 items:
 *                   type: string
 *               maxLoginAttempts:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin access required
 *       500:
 *         description: Server error
 */
router.put('/security', authorize(['administrator']), (req, res, next) => {
  settingsController.updateSecuritySettings(req, res)
    .catch(next);
});

export default router; 