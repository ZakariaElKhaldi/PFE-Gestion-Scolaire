import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../hooks/use-toast'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Building, Grid, List, Plus } from 'lucide-react'
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout'
import { DepartmentsHeader } from '../../components/dashboard/departments/departments-header'
import { DepartmentsFilters } from '../../components/dashboard/departments/departments-filters'
import { DepartmentsTable } from '../../components/dashboard/departments/departments-table'
import { DepartmentCard } from '../../components/dashboard/departments/department-card'
import { DepartmentFormModal } from '../../components/dashboard/departments/department-form-modal'
import { DepartmentFormValues } from '../../components/dashboard/departments/department-form'
import { Department } from '../../types/department'
import { departmentService } from '../../services/department-service'
import { userService } from '../../services/user-service'
import { UserRole } from '../../types/auth'

export function DepartmentsPage() {
  // State management
  const [departments, setDepartments] = useState<Department[]>([])
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentDepartment, setCurrentDepartment] = useState<Department | undefined>(undefined)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  })
  
  const { toast } = useToast()
  
  // Fetch departments data
  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true)
      // Use mock service for development
      const response = await departmentService.getMockDepartments({
        page,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined
      })
      
      setDepartments(response.departments)
      setTotalPages(response.totalPages)
      
      // Calculate stats from all departments (would normally come from API)
      const allDepts = await departmentService.getMockDepartments({
        limit: 1000 // Get all departments for stats
      })
      
      setStats({
        total: allDepts.totalCount,
        active: allDepts.departments.filter(d => d.status === 'active').length,
        inactive: allDepts.departments.filter(d => d.status === 'inactive').length
      })
    } catch (error) {
      console.error('Error fetching departments:', error)
      if (error instanceof Error) {
        // Use a local variable to avoid toast dependency
        toast({
          title: 'Error',
          description: 'Failed to load departments. Please try again.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, searchQuery])
  
  // Mock teachers data
  const fetchTeachers = useCallback(async () => {
    try {
      // Mock teachers data
      setTeachers([
        { id: '1', name: 'Dr. John Smith' },
        { id: '2', name: 'Dr. Sarah Johnson' },
        { id: '3', name: 'Dr. Michael Brown' },
        { id: '4', name: 'Dr. Emily Davis' },
        { id: '5', name: 'Dr. Robert Wilson' },
        { id: '6', name: 'Dr. Jennifer Lee' }
      ])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: 'Failed to load teachers. Some features may be limited.',
          variant: 'destructive',
        })
      }
    }
  }, [])
  
  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchDepartments();
      await fetchTeachers();
    };
    
    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Intentionally empty to only run once on mount

  // Set up listeners for changes to filters
  useEffect(() => {
    if (page > 1 || statusFilter !== 'all' || searchQuery) {
      fetchDepartments();
    }
  }, [page, statusFilter, searchQuery, fetchDepartments]);
  
  // Handle department creation/update
  const handleDepartmentSubmit = async (values: DepartmentFormValues) => {
    try {
      setIsSaving(true)
      
      if (currentDepartment) {
        // Update existing department
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        })
      } else {
        // Create new department
        await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
        toast({
          title: 'Success',
          description: 'Department created successfully',
        })
      }
      
      // Refresh the departments list
      fetchDepartments()
      // Close the modal
      setIsModalOpen(false)
      setCurrentDepartment(undefined)
    } catch (error) {
      console.error('Error saving department:', error)
      throw new Error('Failed to save department')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle department deletion
  const handleDelete = async () => {
    if (!departmentToDelete) return
    
    try {
      setIsDeleting(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay
      
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      })
      
      // Refresh the departments list
      fetchDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete department. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDepartmentToDelete(null)
    }
  }
  
  // Open edit modal
  const handleEdit = (department: Department) => {
    setCurrentDepartment(department)
    setIsModalOpen(true)
  }
  
  // Open delete confirmation dialog
  const handleDeleteClick = (department: Department) => {
    setDepartmentToDelete(department)
    setIsDeleteDialogOpen(true)
  }
  
  // Handle search and filter changes
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1) // Reset to first page when search changes
  }
  
  const handleStatusChange = (status: string) => {
    setStatusFilter(status as 'all' | 'active' | 'inactive')
    setPage(1) // Reset to first page when filter changes
  }
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }
  
  // Mock user for DashboardLayout
  const mockUser = {
    id: '1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'administrator' as UserRole,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  return (
    <DashboardLayout user={mockUser}>
      <div className="flex flex-col space-y-6">
        <DepartmentsHeader 
          onAdd={() => {
            setCurrentDepartment(undefined)
            setIsModalOpen(true)
          }}
          totalDepartments={stats.total}
          activeDepartments={stats.active}
          inactiveDepartments={stats.inactive}
          onRefresh={fetchDepartments}
        />
        
        <DepartmentsFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onSearchChange={handleSearch}
          onStatusChange={handleStatusChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRefresh={fetchDepartments}
        />
        
        <div className="flex justify-end space-x-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="w-10 h-10 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="w-10 h-10 p-0"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
        
        {viewMode === 'list' ? (
          <DepartmentsTable
            departments={departments}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onAdd={() => {
              setCurrentDepartment(undefined)
              setIsModalOpen(true)
            }}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-lg border border-border bg-card animate-pulse"
                />
              ))
            ) : departments.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12">
                <Building className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium">No departments found</p>
                <p className="text-sm text-gray-500 mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first department to get started'}
                </p>
                {searchQuery || statusFilter !== 'all' ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setCurrentDepartment(undefined)
                      setIsModalOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                )}
              </div>
            ) : (
              departments.map((department) => (
                <DepartmentCard
                  key={department.id}
                  department={department}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onViewDetails={handleEdit}
                />
              ))
            )}
          </div>
        )}
        
        {/* Pagination controls */}
        {!isLoading && departments.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Department Form Modal */}
      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setCurrentDepartment(undefined)
        }}
        onSubmit={handleDepartmentSubmit}
        department={currentDepartment}
        teachers={teachers}
        isLoading={isSaving}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department 
              <span className="font-semibold"> {departmentToDelete?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}

export default DepartmentsPage;