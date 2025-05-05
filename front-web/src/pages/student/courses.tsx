import { useState, useEffect } from "react"
import { User } from "../../types/auth"
import { StudentLayout } from "../../components/dashboard/layout/student-layout"
import { CourseRegistrationModal } from "../../components/dashboard/student/course-registration-modal"
import { BookOpen, Clock, Users, Plus, Search, CheckCircle, AlertCircle, FileText, GraduationCap, TrendingUp, Book, Video } from "lucide-react"
import { studentService, StudentCourseFilters } from "../../services/student-service"
import { toast } from "react-hot-toast"

interface StudentCoursesProps {
  user: User
}

interface Course {
  id: string
  code: string
  name: string
  description: string
  instructor: string
  credits: number
  schedule: {
    day: string
    time: string
    room: string
  }[]
  prerequisites: string[]
  capacity: number
  enrolled: number
  status: 'active' | 'completed' | 'not_started'
  progress?: number
  grade?: number
  materials?: {
    type: 'document' | 'video' | 'assignment'
    title: string
    dueDate?: string
    completed?: boolean
  }[]
  nextAssignment?: {
    title: string
    dueDate: string
    type: 'quiz' | 'assignment' | 'project'
  }
  averageGrade?: number
  recentActivity?: {
    type: 'grade' | 'material' | 'announcement'
    title: string
    date: string
    description: string
  }[]
}

export default function StudentCourses({ user }: StudentCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<Course["status"] | "all">("all")
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [view, setView] = useState<"grid" | "calendar">("grid")
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async (filterOptions: StudentCourseFilters = {}) => {
      setLoading(true)
      setError(null)
      
      try {
        const data = await studentService.getStudentCourses(filterOptions)
        
        // Transform API data to match our Course interface
        const transformedCourses: Course[] = data.map(course => ({
          id: course.id,
          code: course.code,
          name: course.name,
          description: course.description,
          instructor: course.teacherId || 'Unknown Instructor', // Default since teacher name is not provided
          credits: course.credits,
          schedule: [], // This would need to be populated from a separate API call if needed
          prerequisites: [], // This would need to be populated from a separate API call if needed
          capacity: 30, // Default capacity
          enrolled: 0, // Default enrolled count
          status: course.status as Course["status"],
          progress: 65, // Placeholder - would need to be calculated from actual progress data
          grade: 85 // Placeholder - would need to be calculated from actual grade data
        }))
        
        setCourses(transformedCourses)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourses({
      status: selectedStatus === 'all' ? undefined : selectedStatus,
      search: searchQuery || undefined
    })
  }, [searchQuery, selectedStatus])

  // This would be replaced with an actual API call to get available courses
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      // Placeholder - would be replaced with an actual API call
      setAvailableCourses([
        {
          id: "c4",
          code: "CHEM201",
          name: "Organic Chemistry",
          description: "Study of organic compounds and their reactions.",
          instructor: "Dr. Robert Wilson",
          credits: 4,
          schedule: [
            { day: "Tuesday", time: "11:00 AM", room: "Lab 201" },
            { day: "Thursday", time: "11:00 AM", room: "Lab 201" }
          ],
          prerequisites: ["CHEM101"],
          capacity: 25,
          enrolled: 18,
          status: "active"
        },
        {
          id: "c5",
          code: "BIO101",
          name: "Introduction to Biology",
          description: "Basic principles of biology and life sciences.",
          instructor: "Dr. Lisa Martinez",
          credits: 3,
          schedule: [
            { day: "Monday", time: "9:00 AM", room: "Room 305" },
            { day: "Wednesday", time: "9:00 AM", room: "Room 305" }
          ],
          prerequisites: [],
          capacity: 35,
          enrolled: 28,
          status: "active"
        }
      ])
    }

    fetchAvailableCourses()
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || course.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0)
  const completedCredits = courses
    .filter(course => course.status === "completed")
    .reduce((sum, course) => sum + course.credits, 0)
  const averageGPA = courses
    .filter(course => course.grade !== undefined)
    .reduce((sum, course) => sum + (course.grade || 0), 0) / 
    courses.filter(course => course.grade !== undefined).length || 0

  const getStatusColor = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return "text-blue-600 bg-blue-50"
      case "completed":
        return "text-green-600 bg-green-50"
      case "not_started":
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: Course["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="h-5 w-5" />
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      case "not_started":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const getAssignmentTypeIcon = (course: Course) => {
    if (!course.nextAssignment) return null

    switch (course.nextAssignment.type) {
      case "quiz":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "assignment":
        return <Book className="h-4 w-4 text-blue-500" />
      case "project":
        return <Users className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-600"
    if (progress >= 50) return "bg-yellow-600"
    return "bg-blue-600"
  }

  const handleCourseRegistration = async (courseIds: string[]) => {
    try {
      // This would be replaced with actual API calls to enroll in courses
      toast.success("Successfully enrolled in selected courses")
      
      // For now, just add the selected courses from availableCourses to courses
      const newCourses = courseIds
        .map(id => {
          const course = availableCourses.find(c => c.id === id)
          if (!course) return null
          
          const newCourse: Course = {
            ...course,
            status: "not_started",
            progress: 0
          }
          return newCourse
        })
        .filter((course): course is NonNullable<typeof course> => course !== null)

      setCourses(prev => [...prev, ...newCourses])
    } catch (error) {
      console.error("Failed to enroll in courses:", error)
      toast.error("Failed to enroll in courses. Please try again later.")
    }
  }

  if (loading) {
    return (
      <StudentLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="mt-1 text-sm text-gray-500">
              {courses.length} courses • {completedCredits}/{totalCredits} credits completed
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setView("grid")}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  view === "grid"
                    ? "bg-blue-50 text-blue-600 border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  view === "calendar"
                    ? "bg-blue-50 text-blue-600 border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Calendar
              </button>
            </div>
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Current GPA</h3>
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {averageGPA.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Active Courses</h3>
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {courses.filter(c => c.status === "active").length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Assignments</h3>
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {courses.filter(c => c.nextAssignment).length}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)}%
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-lg border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as Course["status"] | "all")}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Upcoming Assignments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Assignments</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {courses
              .filter(course => course.nextAssignment)
              .sort((a, b) => new Date(a.nextAssignment!.dueDate).getTime() - new Date(b.nextAssignment!.dueDate).getTime())
              .slice(0, 3)
              .map(course => (
                <div key={course.id} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">{course.code}</span>
                      <h3 className="mt-1 font-medium text-gray-900">{course.nextAssignment!.title}</h3>
                    </div>
                    {getAssignmentTypeIcon(course)}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium">{new Date(course.nextAssignment!.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Course List */}
        {view === "grid" ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map(course => (
              <div key={course.id} className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">{course.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {course.status.replace("_", " ").charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                  </div>
                  {getStatusIcon(course.status)}
                </div>

                {course.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Credits</span>
                    <p className="mt-1 font-medium text-gray-900">{course.credits}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Grade</span>
                    <p className="mt-1 font-medium text-gray-900">{course.grade || "N/A"}</p>
                  </div>
                </div>

                {course.materials && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Recent Materials</h4>
                    <div className="mt-2 space-y-2">
                      {course.materials.slice(0, 2).map((material, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            {material.type === "document" ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : material.type === "video" ? (
                              <Video className="h-4 w-4 text-purple-500" />
                            ) : (
                              <Book className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-gray-900">{material.title}</span>
                          </span>
                          {material.completed && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.recentActivity && course.recentActivity.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500">Recent Activity</h4>
                    <div className="mt-2 space-y-2">
                      {course.recentActivity.slice(0, 2).map((activity, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{activity.title}</span>
                            <span className="text-gray-500">{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600">{activity.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-6">
            {/* Calendar view implementation */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              {/* Calendar cells would go here */}
            </div>
          </div>
        )}
      </div>

      {showRegistrationModal && (
        <CourseRegistrationModal
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onRegister={handleCourseRegistration}
          availableCourses={availableCourses}
        />
      )}
    </StudentLayout>
  )
}