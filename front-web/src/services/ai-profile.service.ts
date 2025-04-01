import axios from 'axios';
import { API_URL } from '@/config/constants';
import { getAuthHeader } from '@/utils/auth';

interface ProfileQueryResponse {
  response: string;
  metadata?: {
    sources?: string[];
    [key: string]: any;
  };
}

export const AiProfileService = {
  /**
   * Query the AI profile with a specific question
   */
  async queryProfile(query: string, context?: string): Promise<ProfileQueryResponse> {
    const response = await axios.post(
      `${API_URL}/ai-profiles/query`,
      { query, context },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  /**
   * Get AI-powered explanations for course materials
   */
  async getCourseMaterialExplanation(materialId: string, studentLevel: string = 'intermediate'): Promise<string> {
    const response = await axios.get(
      `${API_URL}/ai-profiles/materials/${materialId}/explanation?studentLevel=${studentLevel}`,
      { headers: getAuthHeader() }
    );
    return response.data.explanation;
  },

  /**
   * Get AI-powered learning recommendations
   */
  async getPersonalizedRecommendations(studentId: string, courseId: string): Promise<string> {
    const response = await axios.get(
      `${API_URL}/ai-profiles/students/${studentId}/courses/${courseId}/recommendations`,
      { headers: getAuthHeader() }
    );
    return response.data.recommendations;
  }
}; 