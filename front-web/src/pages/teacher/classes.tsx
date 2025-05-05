import { useState, useEffect } from "react"
import { User } from "../../types/auth"
import { TeacherLayout } from "../../components/dashboard/layout/teacher-layout"
import { teacherService, TeacherClass } from "../../services/teacher.service"
import { Loader2, Users, Clock, MapPin, CalendarDays, GraduationCap } from "lucide-react"
import { toast } from "react-hot-toast"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { useNavigate } from "react-router-dom"

interface TeacherClassesProps {
  user: User
}

export default function TeacherClasses({ user }: TeacherClassesProps) {
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      const data = await teacherService.getClasses()
      setClasses(data)
    } catch (error) {
      console.error("Failed to fetch classes:", error)
      toast.error("Failed to load classes. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <TeacherLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </TeacherLayout>
    )
  }

  return (
    <TeacherLayout user={user}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your classes and view student information
            </p>
          </div>
        </div>

        {classes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{classItem.name}</CardTitle>
                      <CardDescription>{classItem.courseName}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(classItem.status)}>
                      {classItem.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {classItem.studentCount} Students
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      Room {classItem.room}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule:
                      </div>
                      {classItem.schedule.map((slot, index) => (
                        <div key={index} className="ml-6 text-sm text-gray-500">
                          {slot.day}: {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/dashboard/teacher/classes/${classItem.id}/students`)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Students
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/dashboard/teacher/classes/${classItem.id}/assignments`)}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Assignments
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No classes found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You don't have any classes assigned yet.
            </p>
          </div>
        )}
      </div>
    </TeacherLayout>
  )
} 