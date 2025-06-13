import { apiClient } from "../lib/api-client"
import { User } from "../types/auth"
import { Child } from "../types/models"

export interface CreateUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: User["role"]
  phoneNumber?: string
}

export interface UpdateUserData extends Partial<Omit<CreateUserData, "password">> {}

export interface UserFilters {
  role?: User["role"]
  search?: string
}

class UserService {
  private readonly basePath = "/users"

  async getUsers(filters?: UserFilters) {
    const { data } = await apiClient.get<User[]>(this.basePath, filters as Record<string, string>)
    return data
  }

  async getUser(id: string) {
    const { data } = await apiClient.get<User>(`${this.basePath}/${id}`)
    return data
  }

  async createUser(userData: CreateUserData) {
    const { data } = await apiClient.post<User>(this.basePath, userData)
    return data
  }

  async updateUser(id: string, userData: UpdateUserData) {
    const { data } = await apiClient.put<User>(`${this.basePath}/${id}`, userData)
    return data
  }

  async deleteUser(id: string) {
    await apiClient.delete(`${this.basePath}/${id}`)
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string) {
    const { data } = await apiClient.post<{ message: string }>(
      `${this.basePath}/${id}/password`,
      {
        currentPassword,
        newPassword,
      }
    )
    return data
  }

  async updateProfile(id: string, profileData: FormData) {
    const { data } = await apiClient.put<User>(
      `${this.basePath}/${id}/profile`,
      profileData
    )
    return data
  }

  async getUserProfile(id: string) {
    const { data } = await apiClient.get<User>(`${this.basePath}/${id}`)
    return data
  }

  async updateUserProfile(id: string, profileData: any) {
    const { data } = await apiClient.put<User>(`${this.basePath}/${id}`, profileData)
    return data
  }

  async uploadProfilePicture(id: string, file: File) {
    const formData = new FormData()
    formData.append('profilePicture', file)
    
    const { data } = await apiClient.post<{user: User, profilePicture: string}>(
      `${this.basePath}/profile/picture`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return data
  }
  
  async changePassword(id: string, currentPassword: string, newPassword: string) {
    const { data } = await apiClient.post<{ message: string }>(
      `${this.basePath}/${id}/password`,
      {
        currentPassword,
        newPassword,
      }
    )
    return data
  }

  // Parent-Child Relationships
  async getChildren(parentId: string) {
    const { data } = await apiClient.get<Child[]>(
      `${this.basePath}/${parentId}/children`
    )
    return data
  }

  async addChild(parentId: string, childData: Partial<Child>) {
    const { data } = await apiClient.post<Child>(
      `${this.basePath}/${parentId}/children`,
      childData
    )
    return data
  }

  async removeChild(parentId: string, childId: string) {
    await apiClient.delete(
      `${this.basePath}/${parentId}/children/${childId}`
    )
  }

  // Teacher-specific endpoints
  async getTeacherStudents(teacherId: string) {
    const { data } = await apiClient.get<User[]>(
      `${this.basePath}/${teacherId}/students`
    )
    return data
  }

  async getTeacherClasses(teacherId: string) {
    const { data } = await apiClient.get<User[]>(
      `${this.basePath}/${teacherId}/classes`
    )
    return data
  }

  // Student-specific endpoints
  async getStudentCourses(studentId: string) {
    const { data } = await apiClient.get<User[]>(
      `${this.basePath}/${studentId}/courses`
    )
    return data
  }

  async getStudentGrades(studentId: string) {
    const { data } = await apiClient.get<User[]>(
      `${this.basePath}/${studentId}/grades`
    )
    return data
  }
}

export const userService = new UserService() 