import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './pages/landing';
import { SignInPage } from './pages/auth/sign-in';
import { SignUpPage } from './pages/auth/sign-up';
import { ForgotPasswordPage } from './pages/auth/forgot-password';
import { ResetPasswordPage } from './pages/auth/reset-password';
import { VerifyEmailPage } from '@/pages/auth/verify-email';
import ParentVerificationPage from './pages/parent-verification';
import DebugNav from "@/pages/debug-nav";
import LanguageDemo from './pages/demo/language-demo';
import { Toaster } from 'sonner';
import './index.css';
import { authService } from './services/auth.service';
import { isValidUser, getDashboardUrl, isTokenExpired, checkStudentId } from './lib/auth-utils';
import { initializeAuth } from './lib/api-client';

// Admin Pages
import { AdminHomePage } from '@/pages/dashboard/admin/home';
import { UsersPage } from '@/pages/dashboard/admin/users';
import { ClassesPage } from '@/pages/dashboard/admin/classes';
import { CoursesPage } from '@/pages/dashboard/admin/courses';
import { AnalyticsPage } from '@/pages/dashboard/admin/analytics';
import EventsPage from '@/pages/dashboard/admin/events';
import { NotificationsPage as AdminNotificationsPage } from '@/pages/dashboard/admin/notifications';
import { SettingsPage as AdminSettingsPage } from '@/pages/dashboard/admin/settings';
import { DepartmentsPage } from '@/pages/dashboard/admin/departments';
import { ReportsPage } from '@/pages/dashboard/admin/reports';
import { FinancePage } from '@/pages/dashboard/admin/finance';

// Student Pages
import StudentDashboard from './pages/dashboard/student';
import StudentCourses from './pages/dashboard/student/courses';
import StudentMaterials from './pages/dashboard/student/materials';
import StudentLibrary from './pages/dashboard/student/library';
import StudentCertificates from './pages/dashboard/student/certificates';
import StudentAttendance from './pages/dashboard/student/attendance';
import StudentPayments from './pages/dashboard/student/payments';
import StudentDocuments from './pages/dashboard/student/documents';
import StudentAssignments from './pages/dashboard/student/assignments';
import StudentSupport from './pages/dashboard/student/support';
import StudentFeedback from './pages/dashboard/student/feedback';
import StudentSchedule from './pages/dashboard/student/schedule';
import StudentGrades from './pages/dashboard/student/grades';
import { NotificationsPage as StudentNotificationsPage } from './pages/dashboard/student/notifications';

// Teacher Pages
import TeacherDashboard from './pages/dashboard/teacher';
import TeacherClasses from './pages/dashboard/teacher/classes';
import TeacherMaterials from './pages/dashboard/teacher/materials';
import TeacherStudents from './pages/dashboard/teacher/students';
import TeacherAttendance from './pages/dashboard/teacher/attendance';
import TeacherGradingPage from './pages/dashboard/teacher/grading';
import TeacherAssignments from './pages/dashboard/teacher/assignments';
import TeacherMessages from './pages/dashboard/teacher/messages';
import TeacherDocuments from './pages/dashboard/teacher/documents';
import TeacherCalendar from './pages/dashboard/teacher/calendar';
import TeacherAnalytics from './pages/dashboard/teacher/analytics';
import TeacherGrades from './pages/dashboard/teacher/grades';
import TeacherCurriculum from './pages/dashboard/teacher/curriculum';
import { TeacherSchedule } from './pages/dashboard/teacher/schedule';
import { TeacherFeedbackPage } from './pages/dashboard/teacher/feedback';
import { TeacherReports } from './pages/dashboard/teacher/reports';
import { NotificationsPage as TeacherNotificationsPage } from './pages/dashboard/teacher/notifications';

// Parent Pages
import ParentDashboard from './pages/dashboard/parent';
import ParentChildren from './pages/dashboard/parent/children';
import ParentProgress from './pages/dashboard/parent/progress';
import {ParentMonitoringPage} from './pages/dashboard/parent/monitoring';
import ParentMessages from './pages/dashboard/parent/messages';
import ParentPayments from './pages/dashboard/parent/payments';
import ParentDocuments from './pages/dashboard/parent/documents';
import ParentAttendance from './pages/dashboard/parent/attendance';
import ParentGrades from './pages/dashboard/parent/grades';
import ParentSchedule from './pages/dashboard/parent/schedule';
import ParentFeedback from './pages/dashboard/parent/feedback';
import { NotificationsPage as ParentNotificationsPage } from './pages/dashboard/parent/notifications';

// Shared Pages
import { SharedNotificationsPage } from './pages/dashboard/shared/notifications';
import ProfilePage from './pages/dashboard/profile';
import SettingsPage from './pages/dashboard/settings';
import { ContactPage } from './pages/dashboard/shared/contact';
import { ForumPage } from './pages/dashboard/shared/forum';
import { CreatePostPage } from './pages/dashboard/shared/forum/create';
import { PostPage } from './pages/dashboard/shared/forum/post';

import { UserResponse, UserRole } from '@/types/auth';

// Auth Guard Component
const PrivateRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: UserRole[] }) => {
  const storedUser = localStorage.getItem('user');
  let user = storedUser ? JSON.parse(storedUser) : null;
  const token = localStorage.getItem('auth_token');
  
  // Apply studentId check for student users
  if (user && user.role === 'student') {
    user = checkStudentId(user);
    // Update localStorage if user was modified
    if (storedUser && user.studentId && JSON.parse(storedUser).studentId !== user.studentId) {
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Updated stored user with studentId in localStorage');
    }
  }
  
  // Verify token is not expired
  const isExpired = token ? isTokenExpired(token) : true;
  if (isExpired) {
    console.log('Authentication token expired, redirecting to login');
    authService.logout(); // Clear expired auth data
    return <Navigate to="/auth/sign-in" replace />;
  }
  
  // Add more robust validation of user object
  const userValid = isValidUser(user);
  const hasValidRole = user?.role && allowedRoles.includes(user.role as UserRole);
  
  if (!token || !userValid) {
    console.log('Authentication issue:', {
      hasToken: !!token,
      userValid,
      hasValidRole
    });
    
    // Clear invalid auth data
    if (!userValid && (user || token)) {
      authService.logout();
    }
    
    return <Navigate to="/auth/sign-in" replace />;
  }

  // If user has valid role but is trying to access another role's route
  if (user && user.role && !allowedRoles.includes(user.role as UserRole)) {
    const dashboardUrl = getDashboardUrl(user.role);
    return <Navigate to={dashboardUrl} replace />;
  }

  // Correctly authenticated with valid role
  return <>{children}</>;
};

// Keyboard shortcut handler component
const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Debug navigation shortcut (Ctrl+D or Cmd+D)
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        navigate('/debug');
      }
      
      // Profile shortcut (Ctrl+P or Cmd+P)
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        navigate('/dashboard/profile');
      }
      
      // Settings shortcut (Ctrl+, or Cmd+,)
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        navigate('/dashboard/settings');
      }
      
      // Home shortcut (Alt+H)
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);

  return null;
};

function App() {
  const [user, setUser] = useState<UserResponse | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      
      // Validate the user object has expected properties
      if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
        console.log('User data loaded from localStorage on app initialization:', parsedUser.email);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      return null;
    }
  });

  // This effect should only run once on mount to initialize user data
  useEffect(() => {
    const initializeUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          
          // Validate the user object has expected properties
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            console.log('User state updated during app initialization');
            setUser(parsedUser);
          } else {
            console.warn('Invalid user data in localStorage:', parsedUser);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
        localStorage.removeItem('user');
      }
    };
    
    initializeUserData();
  }, []);  // Empty dependency array is correct here

  // Storage event listener to sync user state with localStorage changes
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        try {
          const userData = event.newValue ? JSON.parse(event.newValue) : null;
          console.log('User data changed in storage:', userData?.email || 'null');
          setUser(userData);
        } catch (error) {
          console.error('Error handling storage change event:', error);
        }
      } else if (event.key === 'auth_token' && !event.newValue) {
        // Token was removed, clear user data
        setUser(null);
      }
    };

    // Handle changes in other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleAuthEvent = (e: CustomEvent) => {
      if (e.detail?.user) {
        console.log('Auth event received with user data:', e.detail.user.email);
        setUser(e.detail.user);
      } else if (e.detail?.action === 'logout') {
        console.log('Logout event received');
        setUser(null);
      }
    };
    
    window.addEventListener('auth-state-changed' as any, handleAuthEvent as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed' as any, handleAuthEvent as EventListener);
    };
  }, []);  

  // Initialize authentication on app startup
  useEffect(() => {
    // Initialize auth and store the cleanup function
    const cleanupAuth = initializeAuth();
    console.log('Authentication initialized');
    
    // Return cleanup function to be called on component unmount
    return () => {
      console.log('Cleaning up authentication initialization');
      cleanupAuth();
    };
  }, []);  // Empty dependency array is correct here

  // Add additional effect to detect and handle corrupted user data
  useEffect(() => {
    if (user && (!user.id || !user.email || !user.role)) {
      console.warn('Detected invalid user object in state, clearing user state');
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <KeyboardShortcuts />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/sign-in" element={<SignInPage />} />
        <Route path="/auth/sign-up" element={<SignUpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
        <Route path="/parent-verification" element={<ParentVerificationPage />} />
        <Route path="/debug" element={<DebugNav />} />
        <Route path="/demo/language" element={<LanguageDemo />} />

        {/* Admin Routes */}
        <Route path="/dashboard/admin" element={<PrivateRoute allowedRoles={['administrator']}><AdminHomePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/users" element={<PrivateRoute allowedRoles={['administrator']}><UsersPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/classes" element={<PrivateRoute allowedRoles={['administrator']}><ClassesPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/courses" element={<PrivateRoute allowedRoles={['administrator']}><CoursesPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/analytics" element={<PrivateRoute allowedRoles={['administrator']}><AnalyticsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/events" element={<PrivateRoute allowedRoles={['administrator']}><EventsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/notifications" element={<PrivateRoute allowedRoles={['administrator']}><AdminNotificationsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/settings" element={<PrivateRoute allowedRoles={['administrator']}><AdminSettingsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/departments" element={<PrivateRoute allowedRoles={['administrator']}><DepartmentsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/reports" element={<PrivateRoute allowedRoles={['administrator']}><ReportsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/finance" element={<PrivateRoute allowedRoles={['administrator']}><FinancePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/profile" element={<PrivateRoute allowedRoles={['administrator']}><ProfilePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/contact" element={<PrivateRoute allowedRoles={['administrator']}><ContactPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/forum" element={<PrivateRoute allowedRoles={['administrator']}><ForumPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/forum/create" element={<PrivateRoute allowedRoles={['administrator']}><CreatePostPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/admin/forum/:postId" element={<PrivateRoute allowedRoles={['administrator']}><PostPage user={user as UserResponse} /></PrivateRoute>} />

        {/* Student Routes */}
        <Route path="/dashboard/student" element={<PrivateRoute allowedRoles={['student']}><StudentDashboard user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/courses" element={<PrivateRoute allowedRoles={['student']}><StudentCourses user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/materials" element={<PrivateRoute allowedRoles={['student']}><StudentMaterials user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/library" element={<PrivateRoute allowedRoles={['student']}><StudentLibrary user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/certificates" element={<PrivateRoute allowedRoles={['student']}><StudentCertificates user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/attendance" element={<PrivateRoute allowedRoles={['student']}><StudentAttendance user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/payments" element={<PrivateRoute allowedRoles={['student']}><StudentPayments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/documents" element={<PrivateRoute allowedRoles={['student']}><StudentDocuments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/assignments" element={<PrivateRoute allowedRoles={['student']}><StudentAssignments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/support" element={<PrivateRoute allowedRoles={['student']}><StudentSupport user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/feedback" element={<PrivateRoute allowedRoles={['student']}><StudentFeedback user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/schedule" element={<PrivateRoute allowedRoles={['student']}><StudentSchedule user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/grades" element={<PrivateRoute allowedRoles={['student']}><StudentGrades user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/notifications" element={<PrivateRoute allowedRoles={['student']}><StudentNotificationsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/profile" element={<PrivateRoute allowedRoles={['student']}><ProfilePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/settings" element={<PrivateRoute allowedRoles={['student']}><SettingsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/forum" element={<PrivateRoute allowedRoles={['student']}><ForumPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/forum/create" element={<PrivateRoute allowedRoles={['student']}><CreatePostPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/student/forum/:postId" element={<PrivateRoute allowedRoles={['student']}><PostPage user={user as UserResponse} /></PrivateRoute>} />

        {/* Teacher Routes */}
        <Route path="/dashboard/teacher" element={<PrivateRoute allowedRoles={['teacher']}><TeacherDashboard user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/classes" element={<PrivateRoute allowedRoles={['teacher']}><TeacherClasses user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/materials" element={<PrivateRoute allowedRoles={['teacher']}><TeacherMaterials user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/students" element={<PrivateRoute allowedRoles={['teacher']}><TeacherStudents user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/attendance" element={<PrivateRoute allowedRoles={['teacher']}><TeacherAttendance user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/grading" element={<PrivateRoute allowedRoles={['teacher']}><TeacherGradingPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/assignments" element={<PrivateRoute allowedRoles={['teacher']}><TeacherAssignments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/messages" element={<PrivateRoute allowedRoles={['teacher']}><TeacherMessages user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/documents" element={<PrivateRoute allowedRoles={['teacher']}><TeacherDocuments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/calendar" element={<PrivateRoute allowedRoles={['teacher']}><TeacherCalendar user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/analytics" element={<PrivateRoute allowedRoles={['teacher']}><TeacherAnalytics user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/grades" element={<PrivateRoute allowedRoles={['teacher']}><TeacherGrades user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/curriculum" element={<PrivateRoute allowedRoles={['teacher']}><TeacherCurriculum user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/schedule" element={<PrivateRoute allowedRoles={['teacher']}><TeacherSchedule user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/feedback" element={<PrivateRoute allowedRoles={['teacher']}><TeacherFeedbackPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/reports" element={<PrivateRoute allowedRoles={['teacher']}><TeacherReports user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/notifications" element={<PrivateRoute allowedRoles={['teacher']}><TeacherNotificationsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/profile" element={<PrivateRoute allowedRoles={['teacher']}><ProfilePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/settings" element={<PrivateRoute allowedRoles={['teacher']}><SettingsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/contact" element={<PrivateRoute allowedRoles={['teacher']}><ContactPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/forum" element={<PrivateRoute allowedRoles={['teacher']}><ForumPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/forum/create" element={<PrivateRoute allowedRoles={['teacher']}><CreatePostPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/teacher/forum/:postId" element={<PrivateRoute allowedRoles={['teacher']}><PostPage user={user as UserResponse} /></PrivateRoute>} />

        {/* Parent Routes */}
        <Route path="/dashboard/parent" element={<PrivateRoute allowedRoles={['parent']}><ParentDashboard user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/children" element={<PrivateRoute allowedRoles={['parent']}><ParentChildren user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/progress" element={<PrivateRoute allowedRoles={['parent']}><ParentProgress user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/monitoring" element={<PrivateRoute allowedRoles={['parent']}><ParentMonitoringPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/messages" element={<PrivateRoute allowedRoles={['parent']}><ParentMessages user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/payments" element={<PrivateRoute allowedRoles={['parent']}><ParentPayments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/documents" element={<PrivateRoute allowedRoles={['parent']}><ParentDocuments user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/attendance" element={<PrivateRoute allowedRoles={['parent']}><ParentAttendance user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/grades" element={<PrivateRoute allowedRoles={['parent']}><ParentGrades user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/schedule" element={<PrivateRoute allowedRoles={['parent']}><ParentSchedule user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/feedback" element={<PrivateRoute allowedRoles={['parent']}><ParentFeedback user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/notifications" element={<PrivateRoute allowedRoles={['parent']}><ParentNotificationsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/profile" element={<PrivateRoute allowedRoles={['parent']}><ProfilePage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/settings" element={<PrivateRoute allowedRoles={['parent']}><SettingsPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/contact" element={<PrivateRoute allowedRoles={['parent']}><ContactPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/forum" element={<PrivateRoute allowedRoles={['parent']}><ForumPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/forum/create" element={<PrivateRoute allowedRoles={['parent']}><CreatePostPage user={user as UserResponse} /></PrivateRoute>} />
        <Route path="/dashboard/parent/forum/:postId" element={<PrivateRoute allowedRoles={['parent']}><PostPage user={user as UserResponse} /></PrivateRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;