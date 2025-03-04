import { Link } from "react-router-dom"

export default function DebugNav() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Navigation</h1>
      
      <div className="space-y-8">
        {/* Student Routes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Student Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/student" className="p-3 rounded border hover:bg-gray-50">
              Student Dashboard
            </Link>
            <Link to="/dashboard/student/courses" className="p-3 rounded border hover:bg-gray-50">
              Student Courses
            </Link>
            <Link to="/dashboard/student/materials" className="p-3 rounded border hover:bg-gray-50">
              Course Materials
            </Link>
            <Link to="/dashboard/student/library" className="p-3 rounded border hover:bg-gray-50">
              Digital Library
            </Link>
            <Link to="/dashboard/student/certificates" className="p-3 rounded border hover:bg-gray-50">
              Certificates
            </Link>
            <Link to="/dashboard/student/attendance" className="p-3 rounded border hover:bg-gray-50">
              Attendance
            </Link>
            <Link to="/dashboard/student/payments" className="p-3 rounded border hover:bg-gray-50">
              Payments
            </Link>
            <Link to="/dashboard/student/documents" className="p-3 rounded border hover:bg-gray-50">
              Documents
            </Link>
          </div>
        </div>

        {/* Teacher Routes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-green-600">Teacher Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/teacher" className="p-3 rounded border hover:bg-gray-50">
              Teacher Dashboard
            </Link>
            <Link to="/dashboard/teacher/classes" className="p-3 rounded border hover:bg-gray-50">
              Classes
            </Link>
            <Link to="/dashboard/teacher/materials" className="p-3 rounded border hover:bg-gray-50">
              Materials
            </Link>
            <Link to="/dashboard/teacher/students" className="p-3 rounded border hover:bg-gray-50">
              Students
            </Link>
            <Link to="/dashboard/teacher/attendance" className="p-3 rounded border hover:bg-gray-50">
              Attendance
            </Link>
            <Link to="/dashboard/teacher/assignments" className="p-3 rounded border hover:bg-gray-50">
              Assignments
            </Link>
            <Link to="/dashboard/teacher/messages" className="p-3 rounded border hover:bg-gray-50">
              Messages
            </Link>
            <Link to="/dashboard/teacher/documents" className="p-3 rounded border hover:bg-gray-50">
              Documents
            </Link>
          </div>
        </div>

        {/* Parent Routes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-600">Parent Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/parent" className="p-3 rounded border hover:bg-gray-50">
              Parent Dashboard
            </Link>
            <Link to="/dashboard/parent/children" className="p-3 rounded border hover:bg-gray-50">
              Children
            </Link>
            <Link to="/dashboard/parent/progress" className="p-3 rounded border hover:bg-gray-50">
              Academic Progress
            </Link>
            <Link to="/dashboard/parent/messages" className="p-3 rounded border hover:bg-gray-50">
              Messages
            </Link>
            <Link to="/dashboard/parent/payments" className="p-3 rounded border hover:bg-gray-50">
              Payments
            </Link>
            <Link to="/dashboard/parent/documents" className="p-3 rounded border hover:bg-gray-50">
              Documents
            </Link>
          </div>
        </div>

        {/* Admin Routes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-red-600">Admin Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/dashboard/admin" className="p-3 rounded border hover:bg-gray-50">
              Admin Dashboard
            </Link>
            <Link to="/dashboard/admin/users" className="p-3 rounded border hover:bg-gray-50">
              Users
            </Link>
            <Link to="/dashboard/admin/classes" className="p-3 rounded border hover:bg-gray-50">
              Classes
            </Link>
            <Link to="/dashboard/admin/settings" className="p-3 rounded border hover:bg-gray-50">
              Settings
            </Link>
            <Link to="/dashboard/admin/certificates" className="p-3 rounded border hover:bg-gray-50">
              Certificates
            </Link>
            <Link to="/dashboard/admin/calendar" className="p-3 rounded border hover:bg-gray-50">
              Calendar
            </Link>
          </div>
        </div>

        {/* Auth Routes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-600">Auth Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/auth/sign-in" className="p-3 rounded border hover:bg-gray-50">
              Sign In
            </Link>
            <Link to="/auth/sign-up" className="p-3 rounded border hover:bg-gray-50">
              Sign Up
            </Link>
            <Link to="/auth/forgot-password" className="p-3 rounded border hover:bg-gray-50">
              Forgot Password
            </Link>
            <Link to="/auth/reset-password" className="p-3 rounded border hover:bg-gray-50">
              Reset Password
            </Link>
          </div>
        </div>

        {/* Threads Route */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Threads</h2>
          <Link to="/threads" className="p-3 rounded border hover:bg-gray-50">
            Index Threads
          </Link>
        </div>

        {/* Communication */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">Communication</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/communication" className="p-3 rounded border hover:bg-gray-50">
              Chat Room
            </Link>
            <Link to="/communication/communication" className="p-3 rounded border hover:bg-gray-50">
              Communication Page
            </Link>
            <Link to="/chat" className="p-3 rounded border hover:bg-gray-50">
              Chat
            </Link>
          </div>
        </div>

        {/* Landing */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-600">Other Pages</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/" className="p-3 rounded border hover:bg-gray-50">
              Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 