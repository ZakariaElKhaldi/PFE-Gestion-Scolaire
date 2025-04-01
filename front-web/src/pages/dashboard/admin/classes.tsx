import { useState } from 'react'
import { DashboardLayout } from '../../../components/dashboard/layout/dashboard-layout'
import { UserResponse } from '../../../types/auth'
import { Class } from '../../../types/class'
import { ClassFormModal, ClassFormData } from '../../../components/dashboard/classes/class-form-modal'
import toast, { Toaster } from 'react-hot-toast'

// Import our new components
import { ClassesHeader } from '../../../components/dashboard/classes/classes-header'
import { ClassesFilters } from '../../../components/dashboard/classes/classes-filters'
import { ClassesTable } from '../../../components/dashboard/classes/classes-table'
import { DeleteClassDialog } from '../../../components/dashboard/classes/delete-class-dialog'

interface ClassesPageProps {
  user: UserResponse
}

export const ClassesPage = ({ user }: ClassesPageProps) => {
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock data - Replace with actual API call
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: 'Mathematics A1',
      grade: '10th Grade',
      teacher: {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        role: 'teacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      studentsCount: 25,
      schedule: 'Monday 09:00-10:30, Wednesday 09:00-10:30',
      room: 'Room 101',
      subject: 'Mathematics',
      status: 'active',
      academicYear: '2024-2025'
    },
    {
      id: '2',
      name: 'Physics B2',
      grade: '11th Grade',
      teacher: {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@example.com',
        role: 'teacher',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      studentsCount: 22,
      schedule: 'Tuesday 11:00-12:30, Thursday 11:00-12:30',
      room: 'Room 203',
      subject: 'Physics',
      status: 'active',
      academicYear: '2024-2025'
    }
  ])

  // Filter classes based on search query and selected filters
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = 
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.teacher?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (cls.teacher?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (cls.room?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    
    const matchesGrade = selectedGrade === 'all' || cls.grade === selectedGrade
    const matchesSubject = selectedSubject === 'all' || cls.subject === selectedSubject

    return matchesSearch && matchesGrade && matchesSubject
  })

  // Event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value)
  }

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value)
  }

  const handleRefresh = () => {
    setSearchQuery('')
    setSelectedGrade('all')
    setSelectedSubject('all')
    toast.success('Filters cleared')
  }

  const handleExport = () => {
    // Mock export functionality - Replace with actual export functionality
    toast.success('Classes exported successfully')
  }

  const handleAddClass = async (data: ClassFormData) => {
    setIsLoading(true)
    try {
      // Mock API call - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newClass: Class = {
        id: Date.now().toString(),
        name: data.name,
        grade: data.grade,
        subject: data.subject,
        teacherId: data.teacherId,
        description: data.description,
        schedule: data.schedule,
        capacity: data.capacity,
        status: 'active',
        academicYear: '2024-2025',
        createdAt: new Date().toISOString()
      }
      
      setClasses(prev => [...prev, newClass])
      toast.success('Class added successfully')
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding class:', error)
      toast.error('Failed to add class')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditClass = async (data: ClassFormData) => {
    if (!selectedClass) return
    
    setIsLoading(true)
    try {
      // Mock API call - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setClasses(prev =>
        prev.map(cls =>
          cls.id === selectedClass.id
            ? {
                ...cls,
                name: data.name,
                grade: data.grade,
                subject: data.subject,
                teacherId: data.teacherId,
                description: data.description,
                schedule: data.schedule,
                capacity: data.capacity,
              }
            : cls
        )
      )
      
      toast.success('Class updated successfully')
      setIsEditModalOpen(false)
      setSelectedClass(null)
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error('Failed to update class')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClass = async () => {
    if (!selectedClass) return
    
    setIsLoading(true)
    try {
      // Mock API call - Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setClasses(prev => prev.filter(cls => cls.id !== selectedClass.id))
      toast.success('Class deleted successfully')
      setIsDeleteModalOpen(false)
      setSelectedClass(null)
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error('Failed to delete class')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditModal = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (classItem: Class) => {
    setSelectedClass(classItem)
    setIsDeleteModalOpen(true)
  }

  const viewClassDetails = (classItem: Class) => {
    toast.success(`Viewing details for ${classItem.name}`)
    // In a real app, you would navigate to the class details page
  }

  return (
    <DashboardLayout user={user}>
      <Toaster />
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header with stats */}
        <ClassesHeader 
          totalClasses={classes.length} 
          onAddClass={() => setIsAddModalOpen(true)} 
        />

        {/* Filters */}
        <ClassesFilters
          searchQuery={searchQuery}
          selectedGrade={selectedGrade}
          selectedSubject={selectedSubject}
          onSearchChange={handleSearchChange}
          onGradeChange={handleGradeChange}
          onSubjectChange={handleSubjectChange}
          onRefresh={handleRefresh}
          onExport={handleExport}
        />

        {/* Classes Table */}
        <ClassesTable
          classes={filteredClasses}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onViewDetails={viewClassDetails}
          onRefresh={handleRefresh}
          onAdd={() => setIsAddModalOpen(true)}
        />
      </div>

      {/* Add Class Modal */}
      <ClassFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddClass}
        title="Add New Class"
      />

      {/* Edit Class Modal */}
      {selectedClass && (
        <ClassFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedClass(null)
          }}
          onSubmit={handleEditClass}
          classData={selectedClass}
          title="Edit Class"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteClassDialog
        isOpen={isDeleteModalOpen}
        classToDelete={selectedClass}
        isLoading={isLoading}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedClass(null)
        }}
        onConfirm={handleDeleteClass}
      />
    </DashboardLayout>
  )
}
