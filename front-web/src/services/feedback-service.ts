import { apiClient } from '../lib/api-client';

export type FeedbackStatus = 'pending' | 'reviewed';

export interface Feedback {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  rating: number;
  comment: string;
  submittedAt: string;
  status: FeedbackStatus;
  teacherResponse?: string;
  teacherResponseDate?: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  teacherAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseStats {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
}

export interface SubmitFeedbackRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
}

export interface TeacherResponseRequest {
  response: string;
}

// Type definition for possible API response formats
interface GenericApiResponse {
  error?: boolean;
  data?: unknown;
  message?: string;
  feedback?: unknown;
  [key: string]: unknown;
}

class FeedbackService {
  /**
   * Helper function to extract feedback data from various API response formats
   */
  private extractFeedbackFromResponse(responseData: GenericApiResponse): Feedback[] {
    console.log('Extracting feedback from API response:', responseData);
    
    if (!responseData) {
      console.warn('Response data is null or undefined');
      return [];
    }

    // Check different possible locations of the feedback data
    if (Array.isArray(responseData)) {
      console.log('Response is already an array, using directly');
      return responseData as Feedback[];
    }

    // Check if data is in data.feedback (most likely)
    if (responseData.data && typeof responseData.data === 'object' && 
        'feedback' in (responseData.data as object) && 
        Array.isArray((responseData.data as { feedback: unknown }).feedback)) {
      console.log('Found feedback at response.data.feedback');
      return (responseData.data as { feedback: Feedback[] }).feedback;
    }

    // Check if data is directly in data (possible)
    if (responseData.data && Array.isArray(responseData.data)) {
      console.log('Found feedback at response.data');
      return responseData.data as Feedback[];
    }

    // Check if feedback key exists at top level
    if (responseData.feedback && Array.isArray(responseData.feedback)) {
      console.log('Found feedback at response.feedback');
      return responseData.feedback as Feedback[];
    }

    // No known structure found
    console.warn('Could not find feedback data in response', responseData);
    return [];
  }

  /**
   * Get feedback for the current student
   */
  async getStudentFeedback(): Promise<Feedback[]> {
    try {
      const response = await apiClient.get<GenericApiResponse>('/feedback/student');
      console.log('Student feedback raw response:', response);
      
      // Extract feedback using our helper method
      return this.extractFeedbackFromResponse(response.data);
    } catch (error) {
      console.error('Error fetching student feedback:', error);
      return [];
    }
  }

  /**
   * Get feedback for a course
   */
  async getCourseFeedback(courseId: string): Promise<Feedback[]> {
    try {
      const response = await apiClient.get<GenericApiResponse>(`/feedback/course/${courseId}`);
      console.log('Course feedback raw response:', response);
      
      // Extract feedback using our helper method
      return this.extractFeedbackFromResponse(response.data);
    } catch (error) {
      console.error('Error fetching course feedback:', error);
      return [];
    }
  }

  /**
   * Get feedback statistics for a course
   */
  async getCourseFeedbackStats(courseId: string): Promise<CourseStats> {
    try {
      const response = await apiClient.get<GenericApiResponse>(`/feedback/course/${courseId}/stats`);
      
      if (response.data?.data && typeof response.data.data === 'object') {
        return response.data.data as CourseStats;
      }
      
      return { averageRating: 0, totalFeedback: 0, ratingDistribution: {} };
    } catch (error) {
      console.error('Error fetching course feedback stats:', error);
      return { averageRating: 0, totalFeedback: 0, ratingDistribution: {} };
    }
  }

  /**
   * Submit feedback for a course
   */
  async submitFeedback(feedbackData: SubmitFeedbackRequest): Promise<{ feedbackId: string; message: string }> {
    const response = await apiClient.post<GenericApiResponse>('/feedback/submit', feedbackData);
    
    if (response.data?.data && typeof response.data.data === 'object') {
      return response.data.data as { feedbackId: string; message: string };
    }
    
    return { feedbackId: '', message: 'Feedback submitted' };
  }

  /**
   * Update feedback
   */
  async updateFeedback(feedbackId: string, feedbackData: UpdateFeedbackRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<GenericApiResponse>(`/feedback/${feedbackId}`, feedbackData);
      
      if (response.data?.data && typeof response.data.data === 'object') {
        return response.data.data as { message: string };
      }
      
      return { message: 'Feedback updated' };
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      await apiClient.delete(`/feedback/${feedbackId}`);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback for the current teacher
   */
  async getTeacherFeedback(): Promise<Feedback[]> {
    try {
      const response = await apiClient.get<GenericApiResponse>('/feedback/teacher');
      console.log('Teacher feedback raw response:', response);
      
      // Extract feedback using our helper method
      return this.extractFeedbackFromResponse(response.data);
    } catch (error) {
      console.error('Error fetching teacher feedback:', error);
      return [];
    }
  }

  /**
   * Add teacher response to feedback
   */
  async addTeacherResponse(feedbackId: string, responseData: TeacherResponseRequest): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<GenericApiResponse>(`/feedback/${feedbackId}/respond`, responseData);
      
      if (response.data?.data && typeof response.data.data === 'object') {
        return response.data.data as { message: string };
      }
      
      return { message: 'Response added' };
    } catch (error) {
      console.error('Error adding teacher response:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService(); 