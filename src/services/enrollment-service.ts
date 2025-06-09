import { API_BASE_URL } from '../config/api-config';

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
}

export const enrollmentService = {
  /**
   * Get all enrollments for a student
   * @param studentId - The ID of the student
   */
  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    const response = await fetch(`${API_BASE_URL}/enrollments/student/${studentId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student enrollments: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Create a new enrollment
   * @param enrollmentData - The enrollment data
   */
  async createEnrollment(enrollmentData: Partial<Enrollment>): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create enrollment: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Update an enrollment status
   * @param enrollmentId - The ID of the enrollment
   * @param status - The new status
   */
  async updateEnrollmentStatus(enrollmentId: string, status: string): Promise<Enrollment> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update enrollment status: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Delete an enrollment
   * @param enrollmentId - The ID of the enrollment
   */
  async deleteEnrollment(enrollmentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete enrollment: ${response.statusText}`);
    }
  },
}; 