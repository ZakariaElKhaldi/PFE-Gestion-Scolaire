import { useEffect, useState } from "react"
import { StudentLayout } from "../../components/dashboard/layout/student-layout"
import { StudentDashboard as StudentDashboardComponent } from "../../components/dashboard/student/student-dashboard"
import { User } from "../../types/auth"
import { studentService, StudentDashboardData } from "../../services/student-service"
import { toast } from "react-hot-toast"

interface StudentDashboardProps {
  user: User
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const data = await studentService.getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast.error("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleDownloadTranscript = () => {
    console.log('Downloading transcript')
    toast.success('Transcript downloaded successfully')
  }

  const handleSubmitAssignment = async (assignmentId: string, file: File) => {
    try {
      // Convert file to content string for API
      const reader = new FileReader()
      reader.onload = async (e) => {
        const content = e.target?.result as string
        await studentService.submitAssignment(assignmentId, { content })
        toast.success(`Assignment submitted successfully`)
      }
      reader.readAsText(file)
    } catch (error) {
      console.error(`Failed to submit assignment:`, error)
      toast.error(`Failed to submit assignment. Please try again.`)
    }
  }

  const handlePaymentComplete = (paymentId: string) => {
    console.log('Payment completed:', paymentId)
    toast.success('Payment processed successfully')
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
      <div className="p-6">
        {dashboardData ? (
          <StudentDashboardComponent
            studentName={user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            grades={dashboardData.recentGrades.map(grade => ({
              subject: grade.courseName || 'Unknown Course',
              grade: grade.score,
              date: safeParseDate(grade.createdAt),
              teacher: 'Teacher',
              feedback: grade.feedback
            }))}
            assignments={dashboardData.upcomingAssignments.map(assignment => ({
              id: assignment.id,
              title: assignment.title,
              subject: assignment.course?.name || 'Unknown Course',
              dueDate: safeParseDate(assignment.dueDate),
              description: assignment.description,
              status: 'pending' as const
            }))}
            schedule={dashboardData.schedule.map(scheduleDay => ({
              day: scheduleDay.day,
              periods: [{
                time: `${scheduleDay.startTime} - ${scheduleDay.endTime}`,
                subject: scheduleDay.courseName || scheduleDay.title,
                teacher: 'Teacher',
                room: scheduleDay.room || 'TBD'
              }]
            }))}
            onDownloadTranscript={handleDownloadTranscript}
            onSubmitAssignment={handleSubmitAssignment}
            onPaymentComplete={handlePaymentComplete}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No dashboard data available.</p>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

/**
 * Safely parse a date string and return a formatted string
 * If the date is invalid, returns 'N/A'
 */
function safeParseDate(dateString: string | Date | undefined): string {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date encountered:', dateString);
      return 'N/A';
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'N/A';
  }
}