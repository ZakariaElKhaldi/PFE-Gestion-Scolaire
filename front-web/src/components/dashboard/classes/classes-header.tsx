import { PlusCircle, BookOpen, Users, Calendar, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Class } from '../../../types/class'

interface ClassesHeaderProps {
  totalClasses: number
  onAddClass: () => void
}

export function ClassesHeader({ totalClasses, onAddClass }: ClassesHeaderProps) {
  // Calculate stats (in a real app, these would come from an API)
  const activeClasses = totalClasses
  const totalTeachers = new Set(Array.from({ length: totalClasses }).map(() => Math.floor(Math.random() * 10))).size
  const totalStudents = totalClasses * 20 // Approximation
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
          <p className="text-gray-500 mt-1">
            Create and manage classes, assign teachers, and organize schedules
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={onAddClass} className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <h3 className="text-2xl font-bold">{activeClasses}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 p-2 rounded-full mr-4">
              <GraduationCap className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Teachers</p>
              <h3 className="text-2xl font-bold">{totalTeachers}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-purple-100 p-2 rounded-full mr-4">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <h3 className="text-2xl font-bold">{totalStudents}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-100 p-2 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <h3 className="text-2xl font-bold">2024-2025</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 