import axios from '../config/axios';
import { Assignment, Submission, SubmissionWithDetails } from '../types/assignment';

// Extended interface to match the original but add our mock data properties
export interface AssignmentWithDetails extends Assignment {
  course?: {
    id: string;
    name: string;
    code: string;
  };
  stats?: {
    submissionCount: number;
    gradedCount: number;
    averageGrade: number | null;
  };
  // Additional properties for mock data
  courseName?: string;
  submissionCount?: number;
  averageGrade?: number | null;
  teacherId?: string;
  teacherName?: string;
}

// Create a more complete mock submission type
export interface MockSubmission extends Omit<SubmissionWithDetails, 'grade' | 'feedback'> {
  studentName?: string;
  comment?: string;
  grade: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
}

// Mock data for assignments
const MOCK_ASSIGNMENTS: Record<string, AssignmentWithDetails[]> = {
  // Teacher assignments (by teacherId)
  '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f': [
    {
      id: 'a1',
      courseId: 'c1',
      courseName: 'Mathematics',
      title: 'Algebra Quiz',
      description: 'Test on basic algebra concepts',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      points: 100,
      status: 'published',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      submissionCount: 25,
      averageGrade: 85,
      teacherId: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      teacherName: 'John Smith'
    },
    {
      id: 'a2',
      courseId: 'c1',
      courseName: 'Mathematics',
      title: 'Calculus Homework',
      description: 'Complete problems 1-20 in Chapter 5',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      points: 50,
      status: 'published',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      submissionCount: 18,
      averageGrade: null,
      teacherId: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      teacherName: 'John Smith'
    },
    {
      id: 'a3',
      courseId: 'c2',
      courseName: 'Physics',
      title: 'Newton\'s Laws Lab',
      description: 'Perform experiments related to Newton\'s laws of motion',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      points: 75,
      status: 'published',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      submissionCount: 12,
      averageGrade: null,
      teacherId: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      teacherName: 'John Smith'
    },
    {
      id: 'a4',
      courseId: 'c3',
      courseName: 'Chemistry',
      title: 'Periodic Table Quiz',
      description: 'Test on the periodic table of elements',
      dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      points: 50,
      status: 'closed',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      submissionCount: 30,
      averageGrade: 92,
      teacherId: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      teacherName: 'John Smith'
    },
    {
      id: 'a5',
      courseId: 'c3',
      courseName: 'Chemistry',
      title: 'Acid-Base Reactions Lab',
      description: 'Conduct experiments on acid-base reactions',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      points: 100,
      status: 'draft',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      submissionCount: 0,
      averageGrade: null,
      teacherId: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      teacherName: 'John Smith'
    }
  ]
};

// Mock submission data
const MOCK_SUBMISSIONS: Record<string, MockSubmission[]> = {
  'a1': [
    {
      id: 's1',
      assignmentId: 'a1',
      studentId: 'stud1',
      studentName: 'Alice Johnson',
      submissionUrl: 'https://example.com/submissions/s1.pdf',
      comment: 'Here is my completed assignment.',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'submitted',
      grade: null,
      feedback: null,
      gradedBy: null,
      gradedAt: null,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 's2',
      assignmentId: 'a1',
      studentId: 'stud2',
      studentName: 'Bob Williams',
      submissionUrl: 'https://example.com/submissions/s2.pdf',
      comment: 'Finished early!',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'graded',
      grade: 92,
      feedback: 'Excellent work!',
      gradedBy: '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f',
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  'a2': [
    {
      id: 's3',
      assignmentId: 'a2',
      studentId: 'stud1',
      studentName: 'Alice Johnson',
      submissionUrl: 'https://example.com/submissions/s3.pdf',
      comment: 'Please review my work.',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'submitted',
      grade: null,
      feedback: null,
      gradedBy: null,
      gradedAt: null,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AssignmentService {
  private baseUrl = '/assignments';

  /**
   * Get all assignments with optional filters
   */
  async getAssignments(filters?: {
    courseId?: string;
    status?: 'draft' | 'published' | 'closed';
    title?: string;
    dueDate?: string;
    dueBefore?: string;
    dueAfter?: string;
    teacherId?: string;
  }): Promise<AssignmentWithDetails[]> {
    // If this is a development/mock environment
    if (process.env.NODE_ENV === 'development' || !axios.defaults.baseURL) {
      // Simulate API delay
      await delay(800);
      
      // If teacherId is provided, return mocked assignments for that teacher
      if (filters?.teacherId && MOCK_ASSIGNMENTS[filters.teacherId]) {
        // Apply additional filters if provided
        let results = [...MOCK_ASSIGNMENTS[filters.teacherId]];
        
        if (filters.courseId) {
          results = results.filter(a => a.courseId === filters.courseId);
        }
        
        if (filters.status) {
          results = results.filter(a => a.status === filters.status);
        }
        
        if (filters.title) {
          results = results.filter(a => a.title.toLowerCase().includes(filters.title!.toLowerCase()));
        }
        
        return results;
      }
      
      // If no teacherId or no matching teacher found, return empty array
      return [];
    }
    
    // Regular API call for production
    try {
      const { data } = await axios.get(this.baseUrl, { params: filters });
      return data.data.assignments;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Return empty array in case of error
      return [];
    }
  }

  /**
   * Get a single assignment by ID
   */
  async getAssignment(id: string): Promise<AssignmentWithDetails | null> {
    // If this is a development/mock environment
    if (process.env.NODE_ENV === 'development' || !axios.defaults.baseURL) {
      // Simulate API delay
      await delay(500);
      
      // Look through all teachers' assignments
      for (const teacherId in MOCK_ASSIGNMENTS) {
        const assignment = MOCK_ASSIGNMENTS[teacherId].find(a => a.id === id);
        if (assignment) {
          return { ...assignment };
        }
      }
      
      // Assignment not found
      return null;
    }
    
    // Regular API call for production
    try {
      const { data } = await axios.get(`${this.baseUrl}/${id}`);
      return data.data.assignment;
    } catch (error) {
      console.error(`Error fetching assignment ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(assignmentData: {
    courseId: string;
    title: string;
    description: string;
    dueDate: string;
    points: number;
    status: 'draft' | 'published' | 'closed';
  }): Promise<Assignment> {
    const { data } = await axios.post(this.baseUrl, assignmentData);
    return data.data.assignment;
  }

  /**
   * Update an existing assignment
   */
  async updateAssignment(id: string, assignmentData: Partial<{
    courseId: string;
    title: string;
    description: string;
    dueDate: string;
    points: number;
    status: 'draft' | 'published' | 'closed';
  }>): Promise<Assignment> {
    const { data } = await axios.put(`${this.baseUrl}/${id}`, assignmentData);
    return data.data.assignment;
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get assignments for a specific course
   */
  async getAssignmentsForCourse(courseId: string): Promise<Assignment[]> {
    const { data } = await axios.get(`${this.baseUrl}/course/${courseId}`);
    return data.data.assignments;
  }

  /**
   * Get upcoming assignments
   */
  async getUpcomingAssignments(limit?: number): Promise<Assignment[]> {
    const { data } = await axios.get(`${this.baseUrl}/upcoming`, {
      params: { limit }
    });
    return data.data.assignments;
  }

  /**
   * Get recent assignments
   */
  async getRecentAssignments(limit?: number): Promise<Assignment[]> {
    const { data } = await axios.get(`${this.baseUrl}/recent`, {
      params: { limit }
    });
    return data.data.assignments;
  }

  /**
   * Submit an assignment
   */
  async submitAssignment(assignmentId: string, submissionData: {
    submissionUrl?: string;
    comment?: string;
  }): Promise<Submission> {
    const { data } = await axios.post(
      `${this.baseUrl}/${assignmentId}/submit`,
      submissionData
    );
    return data.data.submission;
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId: string, gradeData: {
    grade: number;
    feedback?: string;
  }): Promise<SubmissionWithDetails> {
    const { data } = await axios.post(
      `${this.baseUrl}/submissions/${submissionId}/grade`,
      gradeData
    );
    return data.data.submission;
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissionsForAssignment(assignmentId: string): Promise<SubmissionWithDetails[]> {
    const { data } = await axios.get(`${this.baseUrl}/${assignmentId}/submissions`);
    return data.data.submissions;
  }

  /**
   * Get my submissions
   */
  async getMySubmissions(): Promise<SubmissionWithDetails[]> {
    const { data } = await axios.get(`${this.baseUrl}/submissions/my`);
    return data.data.submissions;
  }

  /**
   * Get assignments for a teacher
   */
  async getTeacherAssignments(filters?: { courseId?: string, status?: string }): Promise<AssignmentWithDetails[]> {
    try {
      console.log('Fetching teacher assignments with filters:', filters);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters?.courseId) params.append('courseId', filters.courseId);
      if (filters?.status) params.append('status', filters.status);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      
      // Call the teacher-specific endpoint
      const response = await axios.get(`/teachers/assignments${queryString}`);
      console.log('Teacher assignments API response:', response.data);
      
      // Check the response structure and handle both data formats
      let assignments = [];
      if (response.data && response.data.data && Array.isArray(response.data.data.assignments)) {
        assignments = response.data.data.assignments;
      } else if (response.data && Array.isArray(response.data.assignments)) {
        assignments = response.data.assignments;
      } else if (Array.isArray(response.data)) {
        assignments = response.data;
      }
      
      // If no assignments were found in the response, log this and use fallback
      if (!assignments || assignments.length === 0) {
        console.log('No assignments found in API response, using mock data');
        return this.getMockTeacherAssignments(filters);
      }
      
      return assignments;
    } catch (error) {
      // Log detailed error information
      console.error('Error fetching teacher assignments:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          console.error('Server responded with error status:', error.response.status);
          console.error('Error data:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received from server');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      }
      
      console.log('Falling back to mock teacher assignments data');
      // For compatibility with existing code, return mock data if API fails
      return this.getMockTeacherAssignments(filters);
    }
  }

  /**
   * Create an assignment as a teacher
   */
  async createTeacherAssignment(data: {
    title: string;
    description?: string;
    courseId: string;
    dueDate: string | Date;
    points?: number;
    status?: 'draft' | 'published' | 'closed';
  }): Promise<AssignmentWithDetails> {
    try {
      // Fixed URL by removing duplicate /api/
      const response = await axios.post('/teachers/assignments', data);
      
      // Handle different response structures
      if (response.data && response.data.data && response.data.data.assignment) {
        return response.data.data.assignment;
      } else if (response.data && response.data.assignment) {
        return response.data.assignment;
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error('Error creating teacher assignment:', error);
      throw error;
    }
  }

  /**
   * Get submissions for a specific assignment as teacher
   */
  async getTeacherSubmissions(assignmentId: string): Promise<MockSubmission[]> {
    try {
      // Fixed URL by removing duplicate /api/
      const response = await axios.get(`/teachers/assignments/${assignmentId}/submissions`);
      
      // Handle different response structures
      let submissions = [];
      if (response.data && response.data.data && Array.isArray(response.data.data.submissions)) {
        submissions = response.data.data.submissions;
      } else if (response.data && Array.isArray(response.data.submissions)) {
        submissions = response.data.submissions;
      } else if (Array.isArray(response.data)) {
        submissions = response.data;
      }
      
      return submissions;
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      // For compatibility, use mock data as fallback
      return this.getMockSubmissions(assignmentId);
    }
  }

  /**
   * Grade a submission as a teacher
   */
  async gradeSubmissionAsTeacher(submissionId: string, data: {
    grade: number;
    feedback?: string;
  }): Promise<MockSubmission> {
    try {
      // Fixed URL by removing duplicate /api/
      const response = await axios.post(`/teachers/submissions/${submissionId}/grade`, data);
      
      // Handle different response structures
      if (response.data && response.data.data && response.data.data.submission) {
        return response.data.data.submission;
      } else if (response.data && response.data.submission) {
        return response.data.submission;
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }

  /**
   * Helper function to get mock teacher assignments (fallback)
   */
  private getMockTeacherAssignments(filters?: { courseId?: string, status?: string }): AssignmentWithDetails[] {
    // Try to get from mock data
    let teacherId = '2ba42f01-28ac-492e-a51f-2beb1b6bfe0f'; // Default teacher ID for mocks
    
    // Get assignments
    const allAssignments = MOCK_ASSIGNMENTS[teacherId] || [];
    
    // Apply filters
    return allAssignments.filter(assignment => {
      // Filter by courseId if provided
      if (filters?.courseId && assignment.courseId !== filters.courseId) {
        return false;
      }
      
      // Filter by status if provided
      if (filters?.status && filters.status !== 'all' && assignment.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Helper function to get mock submissions for an assignment (fallback)
   */
  private getMockSubmissions(assignmentId: string): MockSubmission[] {
    // Simulate API delay
    return MOCK_SUBMISSIONS[assignmentId] || [];
  }
}

const _assignmentService = new AssignmentService();
export const assignmentService = _assignmentService;
export default _assignmentService; 