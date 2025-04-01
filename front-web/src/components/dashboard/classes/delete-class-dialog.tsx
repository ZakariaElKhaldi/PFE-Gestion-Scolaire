import { AlertCircle } from 'lucide-react'
import { Class } from '../../../types/class'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Alert, AlertDescription } from '../../../components/ui/alert'

interface DeleteClassDialogProps {
  isOpen: boolean
  classToDelete: Class | null
  isLoading: boolean
  onClose: () => void
  onConfirm: () => void
}

export function DeleteClassDialog({
  isOpen,
  classToDelete,
  isLoading,
  onClose,
  onConfirm
}: DeleteClassDialogProps) {
  if (!classToDelete) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Class</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the class "{classToDelete.name}"?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col space-y-2 mb-4">
            <div><strong>Grade:</strong> {classToDelete.grade}</div>
            <div><strong>Subject:</strong> {classToDelete.subject}</div>
            {classToDelete.teacher && (
              <div><strong>Teacher:</strong> {classToDelete.teacher.firstName} {classToDelete.teacher.lastName}</div>
            )}
            {classToDelete.studentsCount && (
              <div><strong>Students:</strong> {classToDelete.studentsCount}</div>
            )}
          </div>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action cannot be undone. The class will be permanently removed from the system.
            </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 