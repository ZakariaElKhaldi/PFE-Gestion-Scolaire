import { api } from '../lib/axios'
import { Department, DepartmentFilterParams, DepartmentListResponse } from '../types/department'
import { DepartmentFormValues } from '../components/dashboard/departments/department-form'

class DepartmentService {
  async getDepartments(params?: DepartmentFilterParams): Promise<DepartmentListResponse> {
    const response = await api.get('/departments', { params })
    return response.data
  }

  async getDepartmentById(id: string): Promise<Department> {
    const response = await api.get(`/departments/${id}`)
    return response.data
  }

  async createDepartment(data: DepartmentFormValues): Promise<Department> {
    const response = await api.post('/departments', data)
    return response.data
  }

  async updateDepartment(id: string, data: DepartmentFormValues): Promise<Department> {
    const response = await api.put(`/departments/${id}`, data)
    return response.data
  }

  async deleteDepartment(id: string): Promise<void> {
    await api.delete(`/departments/${id}`)
  }

  // Mock implementation for development
  async getMockDepartments(params?: DepartmentFilterParams): Promise<DepartmentListResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockDepartments: Department[] = [
      {
        id: '1',
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Information Technology',
        headId: '1',
        headName: 'Dr. John Smith',
        status: 'active',
        facultyCount: 12,
        studentCount: 250,
        courseCount: 24,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      },
      {
        id: '2',
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics and Statistics',
        headId: '2',
        headName: 'Dr. Sarah Johnson',
        status: 'active',
        facultyCount: 8,
        studentCount: 180,
        courseCount: 18,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      },
      {
        id: '3',
        name: 'Physics',
        code: 'PHYS',
        description: 'Department of Physics and Astronomy',
        headId: '3',
        headName: 'Dr. Michael Brown',
        status: 'active',
        facultyCount: 6,
        studentCount: 120,
        courseCount: 15,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      },
      {
        id: '4',
        name: 'Chemistry',
        code: 'CHEM',
        description: 'Department of Chemistry and Biochemistry',
        headId: '4',
        headName: 'Dr. Emily Davis',
        status: 'active',
        facultyCount: 7,
        studentCount: 140,
        courseCount: 16,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      },
      {
        id: '5',
        name: 'Biology',
        code: 'BIO',
        description: 'Department of Biological Sciences',
        headId: '5',
        headName: 'Dr. Robert Wilson',
        status: 'active',
        facultyCount: 9,
        studentCount: 200,
        courseCount: 20,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      },
      {
        id: '6',
        name: 'History',
        code: 'HIST',
        description: 'Department of History and Archaeology',
        headId: '6',
        headName: 'Dr. Jennifer Lee',
        status: 'inactive',
        facultyCount: 5,
        studentCount: 90,
        courseCount: 12,
        createdAt: '2023-01-15T00:00:00.000Z',
        updatedAt: '2023-06-20T00:00:00.000Z'
      }
    ]
    
    // Apply filters
    let filteredDepartments = [...mockDepartments]
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      filteredDepartments = filteredDepartments.filter(
        dept => 
          dept.name.toLowerCase().includes(search) || 
          dept.code.toLowerCase().includes(search) ||
          dept.description?.toLowerCase().includes(search) ||
          dept.headName?.toLowerCase().includes(search)
      )
    }
    
    if (params?.status && params.status !== 'all') {
      filteredDepartments = filteredDepartments.filter(
        dept => dept.status === params.status
      )
    }
    
    // Calculate pagination
    const page = params?.page || 1
    const limit = params?.limit || 10
    const totalCount = filteredDepartments.length
    const totalPages = Math.ceil(totalCount / limit)
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex)
    
    return {
      departments: paginatedDepartments,
      totalPages,
      currentPage: page,
      totalCount
    }
  }
}

export const departmentService = new DepartmentService() 