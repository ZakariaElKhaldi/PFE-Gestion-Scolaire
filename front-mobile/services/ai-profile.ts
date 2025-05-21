import { apiClient } from '../utils/api-client';

interface ProfileQueryResponse {
  response: string;
  metadata?: {
    sources?: string[];
    [key: string]: any;
  };
}

class AiProfileServiceClass {
  private basePath = '/ai-profiles';

  /**
   * Query the AI profile with a specific question
   */
  async queryProfile(query: string, context?: string): Promise<ProfileQueryResponse> {
    try {
      const response = await apiClient.post<ProfileQueryResponse>(`${this.basePath}/query`, { 
        query, 
        context 
      });
      return response.data;
    } catch (error) {
      console.error('Error querying AI profile:', error);
      // Return fallback mock response
      return {
        response: "I'm sorry, I couldn't process your request at the moment. Please try again later."
      };
    }
  }

  /**
   * Get AI-powered explanations for course materials
   */
  async getCourseMaterialExplanation(
    materialId: string, 
    studentLevel: string = 'intermediate'
  ): Promise<string> {
    try {
      const response = await apiClient.get<{ explanation: string }>(
        `${this.basePath}/materials/${materialId}/explanation?studentLevel=${studentLevel}`
      );
      return response.data.explanation;
    } catch (error) {
      console.error('Error getting course material explanation:', error);
      return "I'm sorry, I couldn't generate an explanation at the moment. Please try again later.";
    }
  }

  /**
   * Get AI-powered learning recommendations
   */
  async getPersonalizedRecommendations(
    studentId: string, 
    courseId: string
  ): Promise<string> {
    try {
      const response = await apiClient.get<{ recommendations: string }>(
        `${this.basePath}/students/${studentId}/courses/${courseId}/recommendations`
      );
      return response.data.recommendations;
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return "I'm sorry, I couldn't generate recommendations at the moment. Please try again later.";
    }
  }

  /**
   * Analyze message content to help with writing
   */
  async analyzeText(content: string, type: 'grammar' | 'clarity' | 'tone' = 'clarity'): Promise<string> {
    try {
      const response = await apiClient.post<{ analysis: string }>(
        `${this.basePath}/analyze-text`,
        { content, type }
      );
      return response.data.analysis;
    } catch (error) {
      console.error('Error analyzing text:', error);
      return "I'm sorry, I couldn't analyze the text at the moment. Please try again later.";
    }
  }

  /**
   * Generate response suggestions based on message context
   */
  async generateResponseSuggestions(
    messageContent: string, 
    conversationHistory: string[] = []
  ): Promise<string[]> {
    try {
      const response = await apiClient.post<{ suggestions: string[] }>(
        `${this.basePath}/generate-responses`,
        { messageContent, conversationHistory }
      );
      return response.data.suggestions;
    } catch (error) {
      console.error('Error generating response suggestions:', error);
      return [
        "Thank you for your message.",
        "I'll get back to you soon.",
        "Could you provide more information?"
      ];
    }
  }
}

export const aiProfileService = new AiProfileServiceClass(); 
 
 
 