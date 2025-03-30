import express from 'express';
import { aiProfileController } from '../controllers/ai-profile.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// General AI profile query endpoint
router.post('/query', aiProfileController.queryProfile);

// Get AI-powered explanation for course materials
router.get('/materials/:materialId/explanation', aiProfileController.getCourseMaterialExplanation);

// Get personalized learning recommendations
router.get('/students/:studentId/courses/:courseId/recommendations', aiProfileController.getPersonalizedRecommendations);

export default router; 