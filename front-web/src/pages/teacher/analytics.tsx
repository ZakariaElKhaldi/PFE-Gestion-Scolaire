import { useState } from "react"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import { User } from "../../types/auth"
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface TeacherAnalyticsProps {
  user: User
}

interface PerformanceMetric {
  label: string
  value: number
  change: number
  trend: "up" | "down"
}

interface ClassPerformance {
  className: string
  averageGrade: number
  submissions: number
  totalStudents: number
  attendance: number
  lastWeekTrend: number
}

interface StudentEngagement {
  studentId: string
  name: string
  participation: number
  attendance: number
  assignments: number
  lastActive: string
}

export default function TeacherAnalytics({ user }: TeacherAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "semester">("week")
  const [selectedClass, setSelectedClass] = useState<string>("all")

  // Mock data for performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: "Average Grade",
      value: 82.5,
      change: 3.2,
      trend: "up",
    },
    {
      label: "Submission Rate",
      value: 94.2,
      change: -1.5,
      trend: "down",
    },
    {
      label: "Attendance Rate",
      value: 88.7,
      change: 2.1,
      trend: "up",
    },
    {
      label: "Student Engagement",
      value: 76.3,
      change: 5.4,
      trend: "up",
    },
  ]

  // Mock data for class performance
  const classPerformance: ClassPerformance[] = [
    {
      className: "Mathematics 101",
      averageGrade: 85.2,
      submissions: 45,
      totalStudents: 48,
      attendance: 92,
      lastWeekTrend: 2.3,
    },
    {
      className: "Physics 201",
      averageGrade: 78.9,
      submissions: 38,
      totalStudents: 42,
      attendance: 88,
      lastWeekTrend: -1.2,
    },
    {
      className: "Chemistry 301",
      averageGrade: 81.5,
      submissions: 32,
      totalStudents: 35,
      attendance: 90,
      lastWeekTrend: 1.8,
    },
  ]

  // Mock data for student engagement
  const studentEngagement: StudentEngagement[] = [
    {
      studentId: "1",
      name: "John Smith",
      participation: 85,
      attendance: 92,
      assignments: 95,
      lastActive: "2025-03-07T10:30:00",
    },
    {
      studentId: "2",
      name: "Emma Johnson",
      participation: 78,
      attendance: 88,
      assignments: 82,
      lastActive: "2025-03-07T09:15:00",
    },
    {
      studentId: "3",
      name: "Michael Brown",
      participation: 92,
      attendance: 95,
      assignments: 88,
      lastActive: "2025-03-07T11:45:00",
    },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track student performance, engagement, and class progress
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="semester">This Semester</option>
            </select>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              <option value="math101">Mathematics 101</option>
              <option value="phys201">Physics 201</option>
              <option value="chem301">Chemistry 301</option>
            </select>
          </div>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {performanceMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">{metric.label}</h3>
                {metric.label === "Average Grade" ? (
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                ) : metric.label === "Submission Rate" ? (
                  <CheckCircle2 className="h-5 w-5 text-gray-400" />
                ) : metric.label === "Attendance Rate" ? (
                  <Users className="h-5 w-5 text-gray-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {metric.value}%
              </p>
              <div className="mt-2 flex items-center">
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`ml-1 text-sm ${
                    metric.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(metric.change)}%
                </span>
                <span className="ml-1 text-sm text-gray-500">vs last {timeRange}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Class Performance */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Class Performance</h2>
          </div>
          <div className="divide-y">
            {classPerformance.map((classData) => (
              <div
                key={classData.className}
                className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 lg:grid-cols-6"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{classData.className}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {classData.submissions}/{classData.totalStudents} submissions
                  </p>
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      {classData.averageGrade}%
                    </span>
                    <span
                      className={`ml-2 flex items-center text-sm ${
                        classData.lastWeekTrend >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {classData.lastWeekTrend >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {Math.abs(classData.lastWeekTrend)}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Average Grade</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold text-gray-900">
                    {classData.attendance}%
                  </span>
                  <p className="mt-1 text-sm text-gray-500">Attendance Rate</p>
                </div>
                <div className="col-span-2">
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${(classData.submissions / classData.totalStudents) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Submission Progress</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Engagement */}
        <div className="rounded-lg border bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Student Engagement</h2>
          </div>
          <div className="divide-y">
            {studentEngagement.map((student) => (
              <div
                key={student.studentId}
                className="grid grid-cols-2 gap-4 px-6 py-4 sm:grid-cols-4 lg:grid-cols-6"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Last active: {new Date(student.lastActive).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <span className="text-2xl font-semibold text-gray-900">
                    {student.participation}%
                  </span>
                  <p className="mt-1 text-sm text-gray-500">Participation</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold text-gray-900">
                    {student.attendance}%
                  </span>
                  <p className="mt-1 text-sm text-gray-500">Attendance</p>
                </div>
                <div>
                  <span className="text-2xl font-semibold text-gray-900">
                    {student.assignments}%
                  </span>
                  <p className="mt-1 text-sm text-gray-500">Assignment Completion</p>
                </div>
                <div className="col-span-2">
                  <div className="flex space-x-2">
                    <div className="h-2 w-1/3 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${student.participation}%` }}
                      />
                    </div>
                    <div className="h-2 w-1/3 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                    <div className="h-2 w-1/3 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${student.assignments}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Participation</span>
                    <span>Attendance</span>
                    <span>Assignments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
