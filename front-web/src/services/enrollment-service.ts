import { API_BASE_URL } from '../config/api-config';
import axios from 'axios';

// Create an API client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Enrollment {
  id?: string;
  studentId: string;
  courseId: string;
  status?: string;
  enrollmentDate?: string;
  completionDate?: string;
  grade?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  course?: {
    id: string;
    name: string;
    code: string;
    description: string;
    teacherId: string;
    credits: number;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateEnrollmentRequest {
  studentId: string;
  courseId: string;
  status?: string;
}

export interface UpdateEnrollmentRequest {
  status?: string;
  completionDate?: string;
  grade?: string;
}

export interface EnrollmentFilters {
  status?: string;
  courseId?: string;
  studentId?: string;
}

export const enrollmentService = {
  /**
   * Get all enrollments with optional filters
   */
  async getEnrollments(filters?: EnrollmentFilters): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>('/enrollments', filters as Record<string, string>);
    return data;
  },

  /**
   * Get a specific enrollment by ID
   */
  async getEnrollment(id: string): Promise<Enrollment> {
    const { data } = await apiClient.get<Enrollment>(`/enrollments/${id}`);
    return data;
  },

  /**
   * Get all enrollments for a student
   * @param studentId - The ID of the student
   */
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const { data } = await apiClient.get<Enrollment[]>(`/enrollments/student/${studentId}`);
    return data;
  },

  /**
   * Create a new enrollment
   * @param enrollmentData - The enrollment data
   */
  async createEnrollment(enrollmentData: Partial<Enrollment>): Promise<Enrollment> {
    const { data } = await apiClient.post<Enrollment>('/enrollments', enrollmentData);
    return data;
  },

  /**
   * Update an enrollment
   */
  async updateEnrollment(id: string, enrollmentData: UpdateEnrollmentRequest): Promise<Enrollment> {
    const { data } = await apiClient.put<Enrollment>(`/enrollments/${id}`, enrollmentData);
    return data;
  },

  /**
   * Delete an enrollment
   * @param enrollmentId - The ID of the enrollment
   */
  async deleteEnrollment(enrollmentId: string): Promise<void> {
    await apiClient.delete(`/enrollments/${enrollmentId}`);
  },

  /**
   * Get enrollments for a specific course
   */
  async getCourseEnrollments(courseId: string, status?: string): Promise<Enrollment[]> {
    const filters: Record<string, string> = { courseId };
    if (status) {
      filters.status = status;
    }
    const { data } = await apiClient.get<Enrollment[]>(`/enrollments/course/${courseId}`, filters);
    return data;
  },

  /**
   * Update enrollment status
   * @param enrollmentId - The ID of the enrollment
   * @param status - The new status
   */
  async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<Enrollment> {
    const { data } = await apiClient.put<Enrollment>(`/enrollments/${enrollmentId}`, { status });
    return data;
  },

  /**
   * Bulk enroll students in a course
   */
  async bulkEnroll(courseId: string, studentIds: string[]): Promise<{ successful: number; failed: number }> {
    const { data } = await apiClient.post<{ successful: number; failed: number }>(
      '/enrollments/bulk', 
      { courseId, studentIds }
    );
    return data;
  },
}; 