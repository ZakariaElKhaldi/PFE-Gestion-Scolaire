import { Pencil, Trash, MoreHorizontal, ExternalLink, Users, BookOpen } from 'lucide-react'
import { Department } from '../../../types/department'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../../components/ui/dropdown-menu'

interface DepartmentRowProps {
  department: Department
  onEdit: (department: Department) => void
  onDelete: (department: Department) => void
  onViewDetails?: (department: Department) => void
}

export function DepartmentRow({ 
  department, 
  onEdit, 
  onDelete,
  onViewDetails 
}: DepartmentRowProps) {
  // Get the initials for the department code
  const codeInitials = department.code.substring(0, 2).toUpperCase();

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-primary/10">
            <AvatarFallback className="text-primary">
              {codeInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{department.name}</div>
            <div className="text-xs text-gray-500">
              Est. {new Date(department.established).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </td>
      
      <td className="px-3 py-4 text-sm">
        <Badge variant="outline">{department.code}</Badge>
      </td>
      
      <td className="px-3 py-4 text-sm">
        {department.head || 'Not Assigned'}
      </td>
      
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-400 mr-1" />
          <span>{department.facultyCount} faculty</span>
        </div>
      </td>
      
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center">
          <Users className="w-4 h-4 text-gray-400 mr-1" />
          <span>{department.studentCount} students</span>
        </div>
      </td>
      
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center">
          <BookOpen className="w-4 h-4 text-gray-400 mr-1" />
          <span>{department.courses} courses</span>
        </div>
      </td>
      
      <td className="px-3 py-4 text-sm">
        <Badge
          variant={department.status === 'active' ? 'default' : 'secondary'}
          className={
            department.status === 'active'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }
        >
          {department.status}
        </Badge>
      </td>
      
      <td className="px-3 py-4 text-sm text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(department)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(department)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(department)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
} 