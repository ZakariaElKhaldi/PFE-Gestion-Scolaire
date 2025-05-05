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
import { AdminHomePage } from '@/pages/admin/home';
import { UsersPage } from '@/pages/admin/users';
import { ClassesPage } from '@/pages/admin/classes';
import { CoursesPage } from '@/pages/admin/courses';
import { AnalyticsPage } from '@/pages/admin/analytics';
import EventsPage from '@/pages/admin/events';
import { NotificationsPage as AdminNotificationsPage } from '@/pages/admin/notifications';
import { SettingsPage as AdminSettingsPage } from '@/pages/admin/settings';
import { DepartmentsPage } from '@/pages/admin/departments';
import { ReportsPage } from '@/pages/admin/reports';
import { FinancePage } from '@/pages/admin/finance';

// Student Pages
import StudentDashboard from './pages/student';
import StudentCourses from './pages/student/courses';
import StudentMaterials from './pages/student/materials';
import StudentLibrary from './pages/student/library';
import StudentCertificates from './pages/student/certificates';
import StudentAttendance from './pages/student/attendance';
import StudentPayments from './pages/student/payments';
import StudentDocuments from './pages/student/documents';
import StudentAssignments from './pages/student/assignments';
import StudentSupport from './pages/student/support';
import StudentFeedback from './pages/student/feedback';
import StudentSchedule from './pages/student/schedule';
import StudentGrades from './pages/student/grades';
import { NotificationsPage as StudentNotificationsPage } from './pages/student/notifications';

// Teacher Pages
import TeacherDashboard from './pages/teacher';
import TeacherClasses from './pages/teacher/classes';
import TeacherMaterials from './pages/teacher/materials';
import TeacherStudents from './pages/teacher/students';
import TeacherAttendance from './pages/teacher/attendance';
import TeacherGradingPage from './pages/teacher/grading';
import TeacherAssignments from './pages/teacher/assignments';
import TeacherMessages from './pages/teacher/messages';
import TeacherDocuments from './pages/teacher/documents';
import TeacherCalendar from './pages/teacher/calendar';
import TeacherAnalytics from './pages/teacher/analytics';
import TeacherGrades from './pages/teacher/grades';
import TeacherCurriculum from './pages/teacher/curriculum';
import { TeacherSchedule } from './pages/teacher/schedule';
import { TeacherFeedbackPage } from './pages/teacher/feedback';
import { TeacherReports } from './pages/teacher/reports';
import { NotificationsPage as TeacherNotificationsPage } from './pages/teacher/notifications';

// Parent Pages
import ParentDashboard from './pages/parent';
import ParentChildren from './pages/parent/children';
import ParentProgress from './pages/parent/progress';
import {ParentMonitoringPage} from './pages/parent/monitoring';
import ParentMessages from './pages/parent/messages';
import ParentPayments from './pages/parent/payments';
import ParentDocuments from './pages/parent/documents';
import ParentAttendance from './pages/parent/attendance';
import ParentGrades from './pages/parent/grades';
import ParentSchedule from './pages/parent/schedule';
import ParentFeedback from './pages/parent/feedback';
import { NotificationsPage as ParentNotificationsPage } from './pages/parent/notifications';

// Shared Pages
import { SharedNotificationsPage } from './pages/shared/notifications';
import ProfilePage from './pages/profile';
import SettingsPage from './pages/settings';
import { ContactPage } from './pages/shared/contact';
import { ForumPage } from './pages/shared/forum';
import { CreatePostPage } from './pages/shared/forum/create';
import { PostPage } from './pages/shared/forum/post';

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