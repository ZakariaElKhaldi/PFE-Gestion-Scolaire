import { Building } from 'lucide-react'
import { Department } from '../../../types/department'
import { DepartmentRow } from './department-row'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table'

interface DepartmentsTableProps {
  departments: Department[]
  isLoading: boolean
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
  onViewDetails?: (department: Department) => void
  onAdd: () => void
  searchQuery: string
  statusFilter: string
}

export function DepartmentsTable({
  departments,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onAdd,
  searchQuery,
  statusFilter
}: DepartmentsTableProps) {
  const hasFilters = searchQuery || statusFilter !== 'all'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Departments</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="ml-2">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No departments found</p>
            <p className="text-sm text-gray-500 mb-4">
              {hasFilters
                ? 'Try adjusting your search or filters'
                : 'Create your first department to get started'}
            </p>
            {hasFilters ? (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={onAdd}>Add Department</Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Head</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <DepartmentRow
                    key={department.id}
                    department={department}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 