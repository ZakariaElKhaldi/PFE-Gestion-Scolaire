import { Pencil, Trash, MoreHorizontal, ExternalLink, Users } from 'lucide-react'
import { Class } from '../../../types/class'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu'

interface ClassRowProps {
  classItem: Class
  onEdit: (classItem: Class) => void
  onDelete: (classItem: Class) => void
  onViewDetails?: (classItem: Class) => void
}

export function ClassRow({ classItem, onEdit, onDelete, onViewDetails }: ClassRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex flex-col">
          <div className="font-medium text-gray-900">{classItem.name}</div>
          <div className="text-gray-500 flex items-center gap-1">
            <Badge variant="outline" className="mr-1">{classItem.grade}</Badge>
            <Badge variant="outline">{classItem.subject}</Badge>
          </div>
        </div>
      </td>
      
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {classItem.teacher ? (
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={classItem.teacher.profilePicture} alt={`${classItem.teacher.firstName} ${classItem.teacher.lastName}`} />
              <AvatarFallback className="bg-primary text-white">
                {classItem.teacher.firstName?.[0]}
                {classItem.teacher.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">
                {classItem.teacher.firstName} {classItem.teacher.lastName}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )}
      </td>
      
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {classItem.schedule || '-'}
      </td>
      
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {classItem.room || '-'}
      </td>
      
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{classItem.studentsCount || 0} students</span>
        </div>
      </td>
      
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <Badge
          className={
            classItem.status === 'active'
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }
        >
          {classItem.status || 'active'}
        </Badge>
      </td>
      
      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewDetails && (
              <DropdownMenuItem onClick={() => onViewDetails(classItem)}>
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEdit(classItem)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(classItem)}
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