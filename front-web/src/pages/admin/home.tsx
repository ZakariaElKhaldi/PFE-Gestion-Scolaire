import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/dashboard/layout/dashboard-layout'
import { EnrollmentTrendChart } from '../../components/dashboard/charts/enrollment-trend-chart'
import { TeacherStudentRatioChart } from '../../components/dashboard/charts/teacher-student-ratio-chart'
import { AttendanceSummaryChart } from '../../components/dashboard/charts/attendance-summary-chart'
import { QuickStatsSection } from '../../components/dashboard/sections/quick-stats-section'
import { RecentActivitiesSection } from '../../components/dashboard/sections/recent-activities-section'
import { UserResponse } from '../../types/auth'
import { adminService } from '../../services/admin-service' 
import { toast } from 'react-hot-toast'

interface AdminHomePageProps {
  user: UserResponse
}

interface AdminDashboardData {
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalParents: number;
    studentChange: number;
    teacherChange: number;
    parentChange: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'registration' | 'payment' | 'attendance' | 'grade' | 'system';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

// Default dashboard data to use as fallback
const DEFAULT_DASHBOARD_DATA: AdminDashboardData = {
  stats: {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalParents: 0,
    studentChange: 0,
    teacherChange: 0,
    parentChange: 0
  },
  recentActivities: []
};

export const AdminHomePage = ({ user }: AdminHomePageProps) => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(DEFAULT_DASHBOARD_DATA)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await adminService.getDashboardData()
        setDashboardData(data || DEFAULT_DASHBOARD_DATA)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        toast.error("Failed to load dashboard data. Please try again later.")
        // Set default data on error
        setDashboardData(DEFAULT_DASHBOARD_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  // Safely access dashboard data with fallbacks
  const stats = dashboardData?.stats || DEFAULT_DASHBOARD_DATA.stats;
  const activities = dashboardData?.recentActivities || DEFAULT_DASHBOARD_DATA.recentActivities;

  const quickStats = [
    {
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      change: { value: stats.studentChange, trend: 'up' as const },
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Total Teachers',
      value: stats.totalTeachers.toLocaleString(),
      change: { value: stats.teacherChange, trend: 'up' as const },
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
    {
      title: 'Total Classes',
      value: stats.totalClasses.toLocaleString(),
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      title: 'Total Parents',
      value: stats.totalParents.toLocaleString(),
      change: { value: stats.parentChange, trend: 'up' as const },
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your school's performance and recent activities
          </p>
        </div>

        {/* Quick Stats Section */}
        <QuickStatsSection stats={quickStats} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trend</h3>
            <EnrollmentTrendChart />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Teacher-Student Ratio</h3>
            <TeacherStudentRatioChart />
          </div>
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Attendance Summary</h3>
            <AttendanceSummaryChart />
          </div>
        </div>

        {/* Recent Activities Section */}
        <RecentActivitiesSection activities={activities} />
      </div>
    </DashboardLayout>
  )
}
