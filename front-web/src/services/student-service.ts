import { apiClient } from "../lib/api-client";
import assignmentService from "./assignment.service";
import { AssignmentWithDetails, SubmissionWithDetails } from "../types/assignment";
import { Course, Grade, ScheduleItem, CourseMaterial, SubmissionRequest, SubmissionResponse } from "../types/student";

export interface StudentDashboardData {
  courses: Course[];
  upcomingAssignments: AssignmentWithDetails[];
  recentGrades: Grade[];
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    total: number;
    percentage: number;
  };
  schedule: ScheduleItem[];
}

export interface StudentCourseFilters {
  status?: 'active' | 'completed' | 'not_started' | 'all';
  search?: string;
}

class StudentService {
  private readonly basePath = "/students";

  /**
   * Get dashboard data for the current student
   */
  async getDashboardData(): Promise<StudentDashboardData> {
    const { data } = await apiClient.get<StudentDashboardData>(`${this.basePath}/dashboard`);
    return data;
  }

  /**
   * Get dashboard data for a specific student (admin/teacher only)
   */
  async getStudentDashboardData(studentId: string): Promise<StudentDashboardData> {
    const { data } = await apiClient.get<StudentDashboardData>(`${this.basePath}/dashboard/${studentId}`);
    return data;
  }

  /**
   * Get courses for the current student
   */
  async getStudentCourses(filters?: StudentCourseFilters): Promise<Course[]> {
    console.log('StudentService: Fetching courses with filters:', filters);
    try {
      // Create a cleaned filters object without undefined values
      const cleanedFilters: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== 'undefined' && value !== null) {
            cleanedFilters[key] = value;
          }
        });
      }
      
      console.log('StudentService: Using cleaned filters:', cleanedFilters);
      
      // Get the raw response with unknown type
      const response = await apiClient.get<unknown>(`${this.basePath}/courses`, Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined);
      
      console.log('StudentService: Complete API response structure:', JSON.stringify(response.data));
      
      // Check for different possible locations of the courses data
      let courses: Course[] = [];
      
      // Type guard function to check if an object has courses property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasCourses = (obj: any): obj is { courses: Course[] } => 
        obj && Array.isArray(obj.courses);
      
      // Type guard function to check if an object is an array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isArray = (obj: any): obj is any[] => Array.isArray(obj);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;
      
      if (data && data.data && hasCourses(data.data)) {
        // If courses are at response.data.data.courses
        courses = data.data.courses;
        console.log('Found courses at response.data.data.courses');
      } else if (data && data.data && isArray(data.data)) {
        // If courses are directly at response.data.data
        courses = data.data;
        console.log('Found courses at response.data.data (array)');
      } else if (data && hasCourses(data)) {
        // If courses are at response.data.courses
        courses = data.courses;
        console.log('Found courses at response.data.courses');
      } else if (isArray(data)) {
        // If courses are directly in response.data
        courses = data;
        console.log('Found courses directly in response.data');
      }
      
      console.log(`StudentService: Found ${courses.length} courses:`, courses);
      return courses;
    } catch (error) {
      console.error('StudentService: Error fetching courses:', error);
      return [];
    }
  }

  /**
   * Get courses for a specific student (admin/teacher only)
   */
  async getCoursesForStudent(studentId: string, filters?: StudentCourseFilters): Promise<Course[]> {
    console.log('StudentService: Fetching courses for student:', studentId);
    try {
      // Create a cleaned filters object without undefined values
      const cleanedFilters: Record<string, string> = {};
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== 'undefined' && value !== null) {
            cleanedFilters[key] = value;
          }
        });
      }
      
      console.log('StudentService: Using cleaned filters for student courses:', cleanedFilters);
      
      // Get the raw response with unknown type
      const response = await apiClient.get<unknown>(
        `${this.basePath}/${studentId}/courses`, 
        Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined
      );
      
      console.log('StudentService: Complete API response structure:', JSON.stringify(response.data));
      
      // Check for different possible locations of the courses data
      let courses: Course[] = [];
      
      // Type guard function to check if an object has courses property
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hasCourses = (obj: any): obj is { courses: Course[] } => 
        obj && Array.isArray(obj.courses);
      
      // Type guard function to check if an object is an array
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const isArray = (obj: any): obj is any[] => Array.isArray(obj);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;
      
      if (data && data.data && hasCourses(data.data)) {
        // If courses are at response.data.data.courses
        courses = data.data.courses;
        console.log('Found courses at response.data.data.courses');
      } else if (data && data.data && isArray(data.data)) {
        // If courses are directly at response.data.data
        courses = data.data;
        console.log('Found courses at response.data.data (array)');
      } else if (data && hasCourses(data)) {
        // If courses are at response.data.courses
        courses = data.courses;
        console.log('Found courses at response.data.courses');
      } else if (isArray(data)) {
        // If courses are directly in response.data
        courses = data;
        console.log('Found courses directly in response.data');
      }
      
      console.log(`StudentService: Found ${courses.length} courses for student ${studentId}:`, courses);
      return courses;
    } catch (error) {
      console.error('StudentService: Error fetching courses for student:', error);
      return [];
    }
  }

  /**
   * Get upcoming assignments for the current student
   */
  async getUpcomingAssignments(limit?: number): Promise<AssignmentWithDetails[]> {
    try {
      return await assignmentService.getUpcomingAssignments(limit);
    } catch (error) {
      console.error("Error fetching upcoming assignments:", error);
      throw error;
    }
  }

  /**
   * Get upcoming assignments for a specific student (admin/teacher only)
   */
  async getUpcomingAssignmentsForStudent(studentId: string, limit?: number): Promise<AssignmentWithDetails[]> {
    const params = limit ? { limit: limit.toString() } : undefined;
    const { data } = await apiClient.get<AssignmentWithDetails[]>(`${this.basePath}/${studentId}/assignments/upcoming`, params);
    return data;
  }

  /**
   * Get recent grades for the current student
   */
  async getRecentGrades(limit?: number): Promise<Grade[]> {
    const params = limit ? { limit: limit.toString() } : undefined;
    const { data } = await apiClient.get<Grade[]>(`${this.basePath}/grades/recent`, params);
    return data;
  }

  /**
   * Get recent grades for a specific student (admin/teacher/parent only)
   */
  async getRecentGradesForStudent(studentId: string, limit?: number): Promise<Grade[]> {
    const params = limit ? { limit: limit.toString() } : undefined;
    const { data } = await apiClient.get<Grade[]>(`${this.basePath}/${studentId}/grades/recent`, params);
    return data;
  }

  /**
   * Get attendance statistics for the current student
   */
  async getAttendanceStats(): Promise<StudentDashboardData['attendanceStats']> {
    const { data } = await apiClient.get<StudentDashboardData['attendanceStats']>(`${this.basePath}/attendance/stats`);
    return data;
  }

  /**
   * Get attendance statistics for a specific student (admin/teacher/parent only)
   */
  async getAttendanceStatsForStudent(studentId: string): Promise<StudentDashboardData['attendanceStats']> {
    const { data } = await apiClient.get<StudentDashboardData['attendanceStats']>(
      `${this.basePath}/${studentId}/attendance/stats`
    );
    return data;
  }

  /**
   * Get schedule for the current student
   */
  async getSchedule(): Promise<ScheduleItem[]> {
    const { data } = await apiClient.get<ScheduleItem[]>(`${this.basePath}/schedule`);
    return data;
  }

  /**
   * Get schedule for a specific student (admin/teacher/parent only)
   */
  async getScheduleForStudent(studentId: string): Promise<ScheduleItem[]> {
    const { data } = await apiClient.get<ScheduleItem[]>(`${this.basePath}/${studentId}/schedule`);
    return data;
  }

  /**
   * Get course materials for the current student
   */
  async getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
    const { data } = await apiClient.get<CourseMaterial[]>(`${this.basePath}/courses/${courseId}/materials`);
    return data;
  }

  /**
   * Get submissions for the current student
   */
  async getSubmissions(courseId?: string): Promise<SubmissionWithDetails[]> {
    const params = courseId ? { courseId } : undefined;
    const { data } = await apiClient.get<SubmissionWithDetails[]>(`${this.basePath}/submissions`, params);
    return data;
  }

  /**
   * Get submissions for a specific student (admin/teacher only)
   */
  async getSubmissionsForStudent(studentId: string, courseId?: string): Promise<SubmissionWithDetails[]> {
    const params = courseId ? { courseId } : undefined;
    const { data } = await apiClient.get<SubmissionWithDetails[]>(`${this.basePath}/${studentId}/submissions`, params);
    return data;
  }

  /**
   * Submit an assignment
   */
  async submitAssignment(assignmentId: string, submissionData: SubmissionRequest): Promise<SubmissionResponse> {
    const { data } = await apiClient.post<SubmissionResponse>(
      `${this.basePath}/assignments/${assignmentId}/submit`,
      submissionData
    );
    return data;
  }
}

export const studentService = new StudentService();
export default studentService; 