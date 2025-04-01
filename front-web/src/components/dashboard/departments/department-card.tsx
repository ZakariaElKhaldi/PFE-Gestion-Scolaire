import { Building, BookOpen, Users, UserPlus, MoreHorizontal } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu'
import { Department } from '../../../types/department'

interface DepartmentCardProps {
  department: Department
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
  onViewDetails?: (department: Department) => void
}

export function DepartmentCard({
  department,
  onEdit,
  onDelete,
  onViewDetails,
}: DepartmentCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row justify-between items-start pb-2">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Building className="mr-2 h-5 w-5 text-muted-foreground" />
            {department.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Code: <Badge variant="secondary">{department.code}</Badge>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(department)}>
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(department)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(department)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <div className="h-20 overflow-hidden text-sm text-muted-foreground">
          {department.description ? (
            department.description
          ) : (
            <span className="italic">No description available</span>
          )}
        </div>
        <div className="mt-4 space-y-2">
          {department.headId ? (
            <div className="flex items-center text-sm">
              <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Head: {department.headName || 'Unknown'}</span>
            </div>
          ) : (
            <div className="flex items-center text-sm text-muted-foreground">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="italic">No department head assigned</span>
            </div>
          )}
          <div className="flex items-center text-sm">
            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              Faculty: {department.facultyCount || 0} | Students:{' '}
              {department.studentCount || 0}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Courses: {department.courseCount || 0}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 pb-4 flex justify-between">
        <Badge variant={department.status === 'active' ? 'success' : 'destructive'}>
          {department.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(department)}
          className="text-xs"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
} 