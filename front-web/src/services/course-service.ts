import { apiClient } from "../lib/api-client"
import { API_CONFIG } from "../config/api-config"
import { Course, Assignment, Material } from "../types/models"

export interface CreateCourseData {
  name: string
  code: string
  description: string
  teacherId: string
  startDate: string
  endDate: string
  credits: number
  maxStudents?: number
}

export interface UpdateCourseData extends Partial<CreateCourseData> {}

export interface CourseFilters {
  status?: string
  teacherId?: string
  search?: string
  departmentId?: string
}

class CourseService {
  private readonly basePath = "/courses"

  /**
   * Get all courses with optional filters
   */
  async getCourses(filters?: CourseFilters): Promise<Course[]> {
    try {
      const queryParams: Record<string, string> = {}
      
      if (filters) {
        if (filters.status) queryParams.status = filters.status
        if (filters.teacherId) queryParams.teacherId = filters.teacherId
        if (filters.search) queryParams.search = filters.search
        if (filters.departmentId) queryParams.departmentId = filters.departmentId
      }
      
      const { data } = await apiClient.get<Course[]>(this.basePath, queryParams)
      return data
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      return []
    }
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(id: string): Promise<Course> {
    const { data } = await apiClient.get<Course>(`${this.basePath}/${id}`)
    return data
  }

  /**
   * Create a new course
   */
  async createCourse(courseData: CreateCourseData): Promise<Course> {
    const { data } = await apiClient.post<Course>(this.basePath, courseData)
    return data
  }

  /**
   * Update a course
   */
  async updateCourse(id: string, courseData: UpdateCourseData): Promise<Course> {
    const { data } = await apiClient.put<Course>(`${this.basePath}/${id}`, courseData)
    return data
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  /**
   * Get courses for a specific teacher
   */
  async getTeacherCourses(teacherId: string): Promise<Course[]> {
    const { data } = await apiClient.get<Course[]>(`${this.basePath}/teacher/${teacherId}`)
    return data
  }

  /**
   * Get courses for a specific department
   */
  async getDepartmentCourses(departmentId: string): Promise<Course[]> {
    const { data } = await apiClient.get<Course[]>(`${this.basePath}/department/${departmentId}`)
    return data
  }
  
  /**
   * Upload course material
   */
  async uploadCourseMaterial(courseId: string, file: File, materialType: string, title: string): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', materialType)
    formData.append('title', title)
    
    // Use fetch directly for file upload
    const response = await fetch(`${API_CONFIG.API_URL}${this.basePath}/${courseId}/materials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload course material')
    }
    
    return await response.json()
  }

  // Assignments
  async getCourseAssignments(courseId: string) {
    const { data } = await apiClient.get<Assignment[]>(
      `${this.basePath}/${courseId}/assignments`
    )
    return data
  }

  async createCourseAssignment(courseId: string, assignmentData: Partial<Assignment>) {
    const { data } = await apiClient.post<Assignment>(
      `${this.basePath}/${courseId}/assignments`,
      assignmentData
    )
    return data
  }

  // Materials
  async getCourseMaterials(courseId: string) {
    const { data } = await apiClient.get<Material[]>(
      `${this.basePath}/${courseId}/materials`
    )
    return data
  }

  async addCourseMaterial(courseId: string, materialData: Partial<Material>) {
    const { data } = await apiClient.post<Material>(
      `${this.basePath}/${courseId}/materials`,
      materialData
    )
    return data
  }

  // Enrollment
  async enrollStudent(courseId: string, studentId: string) {
    const { data } = await apiClient.post<Course>(
      `${this.basePath}/${courseId}/enroll`,
      { studentId }
    )
    return data
  }

  async unenrollStudent(courseId: string, studentId: string) {
    const { data } = await apiClient.post<Course>(
      `${this.basePath}/${courseId}/unenroll`,
      { studentId }
    )
    return data
  }
}

export const courseService = new CourseService()
export default courseService 