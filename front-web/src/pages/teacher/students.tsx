import { useState } from "react"
import { User } from "../../types/auth"
import { DashboardLayout } from "../../components/dashboard/layout/dashboard-layout"
import {
  Users, BookOpen, BarChart, Mail, Phone, Search, Filter, Notebook, Star, Award, Flag,
  ChevronDown, ChevronUp, MessageSquare, Bookmark, Calendar, Sliders, Download
} from "lucide-react"

interface TeacherStudentsProps {
  user: User
}

interface Student {
  id: string
  name: string
  class: string
  attendance: number
  averageGrade: number
  lastAssessment: string
  parentEmail: string
  parentPhone: string
  status: 'active' | 'inactive' | 'probation'
  notes: string
  performance: {
    assignments: number
    participation: number
    behavior: number
  }
}

export default function TeacherStudents({ user }: TeacherStudentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<string|null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [notes, setNotes] = useState('')

  // Mock data
  const students: Student[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      class: 'Math 101',
      attendance: 95,
      averageGrade: 88,
      lastAssessment: '2025-03-05',
      parentEmail: 'parent1@example.com',
      parentPhone: '+1 555 123 4567',
      status: 'active',
      notes: 'Excels in group projects',
      performance: {
        assignments: 90,
        participation: 85,
        behavior: 95
      }
    },
    {
      id: '2',
      name: 'John Doe',
      class: 'Math 101',
      attendance: 90,
      averageGrade: 85,
      lastAssessment: '2025-03-05',
      parentEmail: 'parent2@example.com',
      parentPhone: '+1 555 123 4567',
      status: 'active',
      notes: 'Needs improvement in individual projects',
      performance: {
        assignments: 85,
        participation: 80,
        behavior: 90
      }
    },
    {
      id: '3',
      name: 'Jane Smith',
      class: 'Math 101',
      attendance: 92,
      averageGrade: 90,
      lastAssessment: '2025-03-05',
      parentEmail: 'parent3@example.com',
      parentPhone: '+1 555 123 4567',
      status: 'active',
      notes: 'Excellent student, always participates in class',
      performance: {
        assignments: 95,
        participation: 95,
        behavior: 95
      }
    },
    // Add more mock students...
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.class === selectedClass
    const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
    return matchesSearch && matchesClass && matchesStatus
  })

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'bg-green-600'
    if (score >= 75) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'probation': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-6">
        {/* Header and Filters */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {students.length} students across {new Set(students.map(s => s.class)).size} classes
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Student Statistics */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Attendance</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Overall Average Grade</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {Math.round(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length)}%
            </p>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-sm font-medium text-gray-500">Students on Probation</h3>
            <p className="mt-2 text-3xl font-semibold text-red-600">
              {students.filter(s => s.status === 'probation').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-lg border bg-white p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Classes</option>
              {Array.from(new Set(students.map(s => s.class))).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Sliders className="h-4 w-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-4">
          {filteredStudents.map(student => (
            <div key={student.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">{student.name}</h2>
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(student.status)}`}>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{student.class}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Last assessed: {new Date(student.lastAssessment).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(student.id)
                      setShowContactModal(true)
                    }}
                    className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                  >
                    <Mail className="h-4 w-4" />
                    Contact
                  </button>
                  <button className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100">
                    <Notebook className="h-4 w-4" />
                    Notes
                  </button>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Academic Performance</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${getPerformanceColor(student.averageGrade)}`}
                        style={{ width: `${student.averageGrade}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{student.averageGrade}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className="h-2 rounded-full bg-green-600"
                        style={{ width: `${student.attendance}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{student.attendance}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Behavior</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${getPerformanceColor(student.performance.behavior)}`}
                        style={{ width: `${student.performance.behavior}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{student.performance.behavior}%</span>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-4">
                <textarea
                  value={student.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Add private notes about this student..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Contact Parent/Guardian</h2>
              <p className="text-gray-600 mt-1">
                Send message to {students.find(s => s.id === selectedStudent)?.parentEmail}
              </p>
            </div>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 text-sm mb-4"
              placeholder="Write your message here..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}