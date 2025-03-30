import axios from 'axios';
import { logger } from '../utils/logger';
import { SERVICE_UNAVAILABLE } from '../types/error-codes';

interface ProfileQueryResponse {
  response: string;
  metadata?: {
    sources?: string[];
    [key: string]: any;
  };
}

class AIProfileService {
  private baseUrl: string;
  private apiKey: string;
  private profileId: string | null = null;

  constructor() {
    this.baseUrl = process.env.AI_PROFILES_API_URL || 'http://localhost:8000/api';
    this.apiKey = process.env.AI_PROFILES_API_KEY || '';
  }

  /**
   * Initialize the service by verifying the API key and getting the profile ID
   */
  async initialize(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.error('AI Profiles API key not configured');
        return false;
      }

      const verifyEndpoint = `${this.baseUrl}/profiles/verify-key`;
      const response = await axios.post(verifyEndpoint, { api_key: this.apiKey });

      if (response.status === 200 && response.data.profile_id) {
        this.profileId = response.data.profile_id;
        logger.info(`AI Profile service initialized with profile ID: ${this.profileId}`);
        return true;
      } else {
        logger.error('Failed to verify AI Profiles API key');
        return false;
      }
    } catch (error) {
      logger.error('Error initializing AI Profile service:', error);
      return false;
    }
  }

  /**
   * Query the AI profile with a specific question
   */
  async queryProfile(question: string, context?: string): Promise<ProfileQueryResponse | null> {
    try {
      // Ensure we have a profile ID
      if (!this.profileId) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Could not initialize AI Profile service');
        }
      }

      const queryEndpoint = `${this.baseUrl}/profiles/${this.profileId}/query`;
      
      const body: any = { query: question };
      if (context) {
        body.context = context;
      }

      const response = await axios.post(queryEndpoint, body);

      if (response.status === 200) {
        return response.data;
      } else {
        logger.error(`Error querying AI profile: ${response.status}`, response.data);
        return null;
      }
    } catch (error) {
      logger.error('Error querying AI profile:', error);
      throw {
        code: SERVICE_UNAVAILABLE,
        message: 'AI Profile service is currently unavailable',
      };
    }
  }

  /**
   * Get AI-powered explanations for course materials
   */
  async getCourseMaterialExplanation(materialId: string, studentLevel: string): Promise<string | null> {
    try {
      const context = `The student's level is ${studentLevel}. They're looking for an explanation of the material.`;
      const query = `Please explain the course material with ID ${materialId} in a way that's appropriate for a ${studentLevel} level student.`;

      const response = await this.queryProfile(query, context);
      return response?.response || null;
    } catch (error) {
      logger.error('Error getting course material explanation:', error);
      return null;
    }
  }

  /**
   * Get AI-powered learning recommendations
   */
  async getPersonalizedRecommendations(studentId: string, courseId: string): Promise<string | null> {
    try {
      const query = `What additional learning resources would you recommend for a student with ID ${studentId} in course ${courseId}?`;
      const response = await this.queryProfile(query);
      return response?.response || null;
    } catch (error) {
      logger.error('Error getting personalized recommendations:', error);
      return null;
    }
  }
}

export const aiProfileService = new AIProfileService(); 