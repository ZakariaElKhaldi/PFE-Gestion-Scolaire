export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  headName?: string;
  status: 'active' | 'inactive';
  facultyCount?: number;
  studentCount?: number;
  courseCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentListResponse {
  departments: Department[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface DepartmentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateDepartmentData {
  name: string;
  code: string;
  headId: string;
  description: string;
  established: string;
  status?: 'active' | 'inactive';
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  headId?: string;
  description?: string;
  established?: string;
  status?: 'active' | 'inactive';
}

export interface DepartmentFormData {
  name: string;
  code: string;
  headId: string;
  description: string;
  established: string;
  status: 'active' | 'inactive';
} 