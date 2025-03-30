import { Request, Response } from 'express';
import { aiProfileService } from '../services/ai-profile.service';
import { logger } from '../utils/logger';

export const aiProfileController = {
  /**
   * Query the AI profile with a specific question
   */
  async queryProfile(req: Request, res: Response) {
    try {
      const { query, context } = req.body;

      if (!query) {
        return res.status(400).json({ message: 'Query is required' });
      }

      const result = await aiProfileService.queryProfile(query, context);
      
      if (!result) {
        return res.status(500).json({ message: 'Failed to get response from AI Profile' });
      }

      return res.json(result);
    } catch (error) {
      logger.error('Error in queryProfile controller:', error);
      return res.status(500).json({ message: 'An error occurred while querying the AI profile' });
    }
  },

  /**
   * Get AI-powered explanations for course materials
   */
  async getCourseMaterialExplanation(req: Request, res: Response) {
    try {
      const { materialId } = req.params;
      const { studentLevel } = req.query;

      if (!materialId) {
        return res.status(400).json({ message: 'Material ID is required' });
      }

      const level = studentLevel?.toString() || 'intermediate';
      const explanation = await aiProfileService.getCourseMaterialExplanation(materialId, level);
      
      if (!explanation) {
        return res.status(500).json({ message: 'Failed to get explanation from AI Profile' });
      }

      return res.json({ explanation });
    } catch (error) {
      logger.error('Error in getCourseMaterialExplanation controller:', error);
      return res.status(500).json({ message: 'An error occurred while getting the explanation' });
    }
  },

  /**
   * Get AI-powered learning recommendations
   */
  async getPersonalizedRecommendations(req: Request, res: Response) {
    try {
      const { studentId, courseId } = req.params;

      if (!studentId || !courseId) {
        return res.status(400).json({ message: 'Student ID and Course ID are required' });
      }

      const recommendations = await aiProfileService.getPersonalizedRecommendations(studentId, courseId);
      
      if (!recommendations) {
        return res.status(500).json({ message: 'Failed to get recommendations from AI Profile' });
      }

      return res.json({ recommendations });
    } catch (error) {
      logger.error('Error in getPersonalizedRecommendations controller:', error);
      return res.status(500).json({ message: 'An error occurred while getting recommendations' });
    }
  }
}; 