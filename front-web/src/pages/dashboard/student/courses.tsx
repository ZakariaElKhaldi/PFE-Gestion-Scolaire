import { useState, useEffect } from "react"
import { User } from "../../../types/auth"
import { StudentLayout } from "../../../components/dashboard/layout/student-layout"
import { CourseRegistrationModal } from "../../../components/dashboard/student/course-registration-modal"
import { BookOpen, Clock, Users, Plus, Search, CheckCircle, AlertCircle, FileText, GraduationCap, TrendingUp, Book, Video } from "lucide-react"
import { studentService } from "../../../services/student-service"
import { toast } from "react-hot-toast"
import { enrollmentService, Enrollment } from "../../../services/enrollment-service"
import { courseService, Course } from "../../../services/course-service"

interface StudentCoursesProps {
  user: User
}

interface StudentCourse extends Course {
  progress?: number
  grade?: string
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
  enrollment?: Enrollment
}

export default function StudentCourses({ user }: StudentCoursesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<"active" | "completed" | "dropped" | "all">("all")
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [view, setView] = useState<"grid" | "calendar">("grid")
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [error, setError] = useState<string | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch student enrollments
        const enrollmentsData = await enrollmentService.getStudentEnrollments(user.id);
        setEnrollments(enrollmentsData);
        
        // Fetch course details for each enrollment
        const coursesData: StudentCourse[] = [];
        
        for (const enrollment of enrollmentsData) {
          if (enrollment.courseId) {
            try {
              const course = await courseService.getCourse(enrollment.courseId);
              
              // Combine course data with enrollment data
              coursesData.push({
                ...course,
                enrollment: enrollment,
                progress: 65, // Placeholder - would need to be calculated from actual progress data
                grade: enrollment.grade || 'N/A'
              });
            } catch (courseError) {
              console.error(`Failed to fetch course ${enrollment.courseId}:`, courseError);
            }
          }
        }
        
        setCourses(coursesData);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  // Fetch available courses for registration
  useEffect(() => {
    const fetchAvailableCourses = async () => {
      try {
        // Get all courses
        const allCourses = await courseService.getCourses();
        
        // Filter out courses the student is already enrolled in
        const enrolledCourseIds = enrollments.map(e => e.courseId);
        const availableCoursesList = allCourses.filter(
          course => !enrolledCourseIds.includes(course.id)
        );
        
        setAvailableCourses(availableCoursesList);
      } catch (error) {
        console.error("Failed to fetch available courses:", error);
        toast.error("Failed to load available courses. Please try again later.");
      }
    };

    if (enrollments.length > 0) {
      fetchAvailableCourses();
    }
  }, [enrollments]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const courseStatus = course.enrollment?.status || 'active';
    const matchesStatus = selectedStatus === "all" || courseStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const completedCredits = courses
    .filter(course => course.enrollment?.status === "completed")
    .reduce((sum, course) => sum + course.credits, 0);

  // Calculate GPA from grades (assuming grades are letter grades or percentages)
  const calculateGPA = (courses: StudentCourse[]) => {
    const coursesWithGrades = courses.filter(course => course.grade && course.grade !== 'N/A');
    
    if (coursesWithGrades.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    for (const course of coursesWithGrades) {
      let gradePoints = 0;
      
      // Convert letter grade or percentage to grade points
      if (course.grade) {
        if (course.grade === 'A' || course.grade === 'A+') gradePoints = 4.0;
        else if (course.grade === 'A-') gradePoints = 3.7;
        else if (course.grade === 'B+') gradePoints = 3.3;
        else if (course.grade === 'B') gradePoints = 3.0;
        else if (course.grade === 'B-') gradePoints = 2.7;
        else if (course.grade === 'C+') gradePoints = 2.3;
        else if (course.grade === 'C') gradePoints = 2.0;
        else if (course.grade === 'C-') gradePoints = 1.7;
        else if (course.grade === 'D+') gradePoints = 1.3;
        else if (course.grade === 'D') gradePoints = 1.0;
        else if (course.grade === 'F') gradePoints = 0.0;
        else {
          // Try to parse as percentage
          const percentage = parseFloat(course.grade);
          if (!isNaN(percentage)) {
            if (percentage >= 90) gradePoints = 4.0;
            else if (percentage >= 80) gradePoints = 3.0;
            else if (percentage >= 70) gradePoints = 2.0;
            else if (percentage >= 60) gradePoints = 1.0;
            else gradePoints = 0.0;
          }
        }
      }
      
      totalPoints += gradePoints * course.credits;
      totalCredits += course.credits;
    }
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };
  
  const averageGPA = calculateGPA(courses);

  const getStatusColor = (status: Enrollment['status']) => {
    switch (status) {
      case "active":
        return "text-blue-600 bg-blue-50"
      case "completed":
        return "text-green-600 bg-green-50"
      case "dropped":
        return "text-gray-600 bg-gray-50"
      default:
        return "text-blue-600 bg-blue-50"
    }
  }

  const getStatusIcon = (status: Enrollment['status']) => {
    switch (status) {
      case "active":
        return <Clock className="h-5 w-5" />
      case "completed":
        return <CheckCircle className="h-5 w-5" />
      case "dropped":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const getAssignmentTypeIcon = (course: StudentCourse) => {
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
      setShowRegistrationModal(false);
      
      if (courseIds.length === 0) {
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading(`Enrolling in ${courseIds.length} course(s)...`);
      
      // Enroll in each selected course
      let successCount = 0;
      
      for (const courseId of courseIds) {
        try {
          await enrollmentService.createEnrollment({
            studentId: user.id,
            courseId: courseId
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to enroll in course ${courseId}:`, error);
        }
      }
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (successCount > 0) {
        toast.success(`Successfully enrolled in ${successCount} course(s)`);
        
        // Refresh enrollments and courses
        const updatedEnrollments = await enrollmentService.getStudentEnrollments(user.id);
        setEnrollments(updatedEnrollments);
        
        // Fetch updated course details
        const updatedCourses: StudentCourse[] = [];
        
        for (const enrollment of updatedEnrollments) {
          if (enrollment.courseId) {
            try {
              const course = await courseService.getCourse(enrollment.courseId);
              
              updatedCourses.push({
                ...course,
                enrollment: enrollment,
                progress: 65, // Placeholder
                grade: enrollment.grade || 'N/A'
              });
            } catch (courseError) {
              console.error(`Failed to fetch course ${enrollment.courseId}:`, courseError);
            }
          }
        }
        
        setCourses(updatedCourses);
      } else {
        toast.error("Failed to enroll in any courses. Please try again.");
      }
    } catch (error) {
      console.error("Course registration error:", error);
      toast.error("Failed to register for courses. Please try again later.");
    }
  };

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
              {averageGPA}
            </p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Active Courses</h3>
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {courses.filter(c => c.enrollment?.status === "active").length}
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
              onChange={(e) => setSelectedStatus(e.target.value as "active" | "completed" | "dropped" | "all")}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(course.enrollment?.status)}`}>
                        {course.enrollment?.status.replace("_", " ").charAt(0).toUpperCase() + course.enrollment?.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                  </div>
                  {getStatusIcon(course.enrollment?.status)}
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