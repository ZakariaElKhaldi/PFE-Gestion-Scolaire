import { Class } from '../../../types/class'
import { ClassRow } from './class-row'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'

interface ClassesTableProps {
  classes: Class[]
  isLoading: boolean
  onEdit: (classItem: Class) => void
  onDelete: (classItem: Class) => void
  onViewDetails?: (classItem: Class) => void
  onRefresh: () => void
  onAdd: () => void
}

export function ClassesTable({
  classes,
  isLoading,
  onEdit,
  onDelete,
  onViewDetails,
  onRefresh,
  onAdd
}: ClassesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="ml-2">Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {classes.length === 0
                ? "No classes have been created yet."
                : "No classes match your search criteria."}
            </p>
            <div className="mt-6">
              {classes.length === 0 ? (
                <Button onClick={onAdd}>Create your first class</Button>
              ) : (
                <Button variant="outline" onClick={onRefresh}>Clear filters</Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem) => (
                  <ClassRow
                    key={classItem.id}
                    classItem={classItem}
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