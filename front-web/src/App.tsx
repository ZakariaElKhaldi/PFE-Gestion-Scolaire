import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/landing'
import { SignInPage } from './pages/auth/sign-in'
import { SignUpPage } from './pages/auth/sign-up'
import { ForgotPasswordPage } from './pages/auth/forgot-password'
import { ResetPasswordPage } from './pages/auth/reset-password'
import { AdminHomePage } from './pages/dashboard/admin/home'
import { UsersPage } from './pages/dashboard/admin/users'
import { ClassesPage } from './pages/dashboard/admin/classes'
import { SettingsPage } from './pages/dashboard/admin/settings'
import { User } from './types/auth'
import CommunicationPage from './pages/communication/communication'
import Certificates from './pages/dashboard/admin/certificates'
import MainCalendar from './pages/dashboard/admin/MainCalendar'
import DebugNav from './pages/debug-nav'
import Chat from './components/communicationUTU/Chat'
import IndexThreads from './pages/IndexThreads'
import { ChatProvider } from '@/contexts/ChatContext'

// Student Pages
import StudentDashboard from './pages/dashboard/student'
import StudentCourses from './pages/dashboard/student/courses'
import StudentMaterials from './pages/dashboard/student/materials'
import StudentLibrary from './pages/dashboard/student/library'
import StudentCertificates from './pages/dashboard/student/certificates'
import StudentAttendance from './pages/dashboard/student/attendance'
import StudentPayments from './pages/dashboard/student/payments'
import StudentDocuments from './pages/dashboard/student/documents'

// Teacher Pages
import TeacherDashboard from './pages/dashboard/teacher'
import TeacherClasses from './pages/dashboard/teacher/classes'
import TeacherMaterials from './pages/dashboard/teacher/materials'
import TeacherStudents from './pages/dashboard/teacher/students'
import TeacherAttendance from './pages/dashboard/teacher/attendance'
import TeacherAssignments from './pages/dashboard/teacher/assignments'
import TeacherMessages from './pages/dashboard/teacher/messages'
import TeacherDocuments from './pages/dashboard/teacher/documents'

// Parent Pages
import ParentDashboard from './pages/dashboard/parent'
import ParentChildren from './pages/dashboard/parent/children'
import ParentProgress from './pages/dashboard/parent/progress'
import ParentMessages from './pages/dashboard/parent/messages'
import ParentPayments from './pages/dashboard/parent/payments'
import ParentDocuments from './pages/dashboard/parent/documents'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function App() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // TODO: Replace this with actual authentication logic
    // This is just a temporary mock user for demonstration
    const mockUser: User = {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'administrator',
    }
    setUser(mockUser)
  }, [])

  return (
    <ChatProvider>
      <Router>
        <Routes>
          {/* Debug Routes */}
          <Route path="/debug" element={<DebugNav />} />
          <Route path="/debug-nav" element={<DebugNav />} />

          {/* Communication Routes */}
          <Route path="/communication" element={<CommunicationPage />} />
          <Route path="/communication/communication" element={<CommunicationPage />} />
          
          {/* Chat Route */}
          <Route path="/chat" element={<Chat />} />

          {/* Threads Route */}
          <Route path="/threads" element={<IndexThreads />} />

          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/sign-up" element={<SignUpPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route
            path="/dashboard/admin"
            element={user ? <AdminHomePage user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/admin/calendar"
            element={user ? <MainCalendar /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/admin/users"
            element={user ? <UsersPage user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/admin/classes"
            element={user ? <ClassesPage user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/admin/settings"
            element={user ? <SettingsPage user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/admin/certificates"
            element={user ? <Certificates user={user} /> : <div>Loading...</div>}
          />

          {/* Student Routes */}
          <Route
            path="/dashboard/student"
            element={user ? <StudentDashboard user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/courses"
            element={user ? <StudentCourses user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/materials"
            element={user ? <StudentMaterials user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/library"
            element={user ? <StudentLibrary user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/certificates"
            element={user ? <StudentCertificates user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/attendance"
            element={user ? <StudentAttendance user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/payments"
            element={user ? <StudentPayments user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/student/documents"
            element={user ? <StudentDocuments user={user} /> : <div>Loading...</div>}
          />

          {/* Teacher Routes */}
          <Route
            path="/dashboard/teacher"
            element={user ? <TeacherDashboard user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/classes"
            element={user ? <TeacherClasses user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/materials"
            element={user ? <TeacherMaterials user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/students"
            element={user ? <TeacherStudents user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/attendance"
            element={user ? <TeacherAttendance user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/assignments"
            element={user ? <TeacherAssignments user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/messages"
            element={user ? <TeacherMessages user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/teacher/documents"
            element={user ? <TeacherDocuments user={user} /> : <div>Loading...</div>}
          />

          {/* Parent Routes */}
          <Route
            path="/dashboard/parent"
            element={user ? <ParentDashboard user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/parent/children"
            element={user ? <ParentChildren user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/parent/progress"
            element={user ? <ParentProgress user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/parent/messages"
            element={user ? <ParentMessages user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/parent/payments"
            element={user ? <ParentPayments user={user} /> : <div>Loading...</div>}
          />
          <Route
            path="/dashboard/parent/documents"
            element={user ? <ParentDocuments user={user} /> : <div>Loading...</div>}
          />
        </Routes>
      </Router>
    </ChatProvider>
  )
}

export default App
