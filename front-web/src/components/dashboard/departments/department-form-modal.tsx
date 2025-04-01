import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import { Department } from '../../../types/department'
import { DepartmentForm, DepartmentFormValues } from './department-form'

interface DepartmentFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: DepartmentFormValues) => Promise<void>
  department?: Department
  teachers: Array<{ id: string; name: string }>
  isLoading: boolean
}

export function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  department,
  teachers,
  isLoading,
}: DepartmentFormModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (values: DepartmentFormValues) => {
    try {
      setError(null)
      await onSubmit(values)
      onClose()
    } catch (error) {
      console.error('Error submitting department form:', error)
      setError('Failed to save department. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {department ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogDescription>
            {department
              ? 'Update the department details below'
              : 'Fill in the department details below to create a new department'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <DepartmentForm
          department={department}
          teachers={teachers}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
} 