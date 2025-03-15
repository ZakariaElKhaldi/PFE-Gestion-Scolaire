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
}

const _assignmentService = new AssignmentService();
export const assignmentService = _assignmentService;
export default _assignmentService; 