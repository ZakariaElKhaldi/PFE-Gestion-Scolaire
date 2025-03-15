import axios from 'axios';

interface Student {
  id: string;
  name: string;
  profileImage?: string;
  className: string;
  email?: string;
  grade?: string;
  attendance?: number;
  performanceScore?: number;
  lastActivity?: string;
}

interface TeacherStudent {
  id: string;
  name: string;
  profileImage?: string;
  email: string;
  grade: string;
  className: string;
  attendance: number;
  avgGrade: string | number;
  lastSubmission?: string;
  status: 'active' | 'inactive';
}

interface Course {
  id: string;
  name: string;
}

interface ClassScheduleItem {
  classId: string;
  className: string;
  courseName: string;
  room: string;
  startTime: string;
  endTime: string;
  studentCount: number;
}

interface FeedbackItem {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  type: 'academic' | 'behavioral' | 'attendance' | 'general';
  content: string;
  rating?: number;
  status: 'pending' | 'reviewed' | 'addressed';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  addressed: number;
  byType: {
    academic: number;
    behavioral: number; 
    attendance: number;
    general: number;
  };
  averageRating: number;
}

interface NewFeedback {
  studentId: string;
  courseId: string;
  type: 'academic' | 'behavioral' | 'attendance' | 'general';
  content: string;
  rating?: number;
  isPrivate: boolean;
}

interface Attendance {
  id: string;
  classId: string;
  className: string;
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  students: Array<{
    id: string;
    name: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    note?: string;
  }>;
}

interface TeacherDashboardStats {
  classes: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  students: {
    total: number;
    averageAttendance: number;
    averagePerformance: number;
  };
  assignments: {
    total: number;
    pending: number;
    graded: number;
    upcoming: number;
  };
  attendance: {
    today: {
      present: number;
      absent: number;
      late: number;
      total: number;
    };
    weekly: {
      present: number;
      absent: number;
      late: number;
      total: number;
    };
  };
  recentActivity: Array<{
    id: string;
    type: 'submission' | 'grade' | 'feedback' | 'material';
    title: string;
    description: string;
    timestamp: string;
    studentName?: string;
    courseName?: string;
  }>;
}

// Mock data
const MOCK_STUDENTS: Student[] = [
  { id: '1', name: 'John Doe', className: 'Grade 10A' },
  { id: '2', name: 'Jane Smith', className: 'Grade 9B' },
  { id: '3', name: 'Alice Johnson', className: 'Grade 10A' },
  { id: '4', name: 'Bob Wilson', className: 'Grade 11C' },
  { id: '5', name: 'Charlie Brown', className: 'Grade 9B' },
];

const MOCK_COURSES: Course[] = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Physics' },
  { id: '3', name: 'Chemistry' },
  { id: '4', name: 'Biology' },
  { id: '5', name: 'History' },
  { id: '6', name: 'English Literature' },
];

// Define class types
interface TeacherClass {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  studentCount: number;
  room: string;
  status: 'active' | 'completed' | 'upcoming';
}

// Mock data for teacher classes
const MOCK_CLASSES: TeacherClass[] = [
  {
    id: 'cls-001',
    name: 'Advanced Mathematics',
    courseId: 'course-001',
    courseName: 'Mathematics',
    schedule: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30' },
      { day: 'Wednesday', startTime: '09:00', endTime: '10:30' }
    ],
    studentCount: 32,
    room: 'Room A101',
    status: 'active'
  },
  {
    id: 'cls-002',
    name: 'Physics Fundamentals',
    courseId: 'course-002',
    courseName: 'Physics',
    schedule: [
      { day: 'Tuesday', startTime: '11:00', endTime: '12:30' },
      { day: 'Thursday', startTime: '11:00', endTime: '12:30' }
    ],
    studentCount: 28,
    room: 'Room B201',
    status: 'active'
  },
  {
    id: 'cls-003',
    name: 'Chemistry Lab',
    courseId: 'course-003',
    courseName: 'Chemistry',
    schedule: [
      { day: 'Monday', startTime: '14:00', endTime: '15:30' },
      { day: 'Friday', startTime: '14:00', endTime: '15:30' }
    ],
    studentCount: 24,
    room: 'Lab C301',
    status: 'active'
  },
  {
    id: 'cls-004',
    name: 'Literature Analysis',
    courseId: 'course-004',
    courseName: 'English Literature',
    schedule: [
      { day: 'Wednesday', startTime: '13:00', endTime: '14:30' }
    ],
    studentCount: 30,
    room: 'Room D401',
    status: 'upcoming'
  },
  {
    id: 'cls-005',
    name: 'World History',
    courseId: 'course-005',
    courseName: 'History',
    schedule: [
      { day: 'Tuesday', startTime: '09:00', endTime: '10:30' },
      { day: 'Thursday', startTime: '09:00', endTime: '10:30' }
    ],
    studentCount: 35,
    room: 'Room E501',
    status: 'completed'
  }
];

// Mock data for class students
interface ClassStudent {
  id: string;
  name: string;
  grade: string;
  attendance: number;
  email: string;
}

const MOCK_CLASS_STUDENTS: Record<string, ClassStudent[]> = {
  'cls-001': [
    { id: 'std-001', name: 'Alice Johnson', grade: 'A', attendance: 95, email: 'alice@example.com' },
    { id: 'std-002', name: 'Bob Smith', grade: 'B+', attendance: 88, email: 'bob@example.com' },
    { id: 'std-003', name: 'Charlie Brown', grade: 'A-', attendance: 92, email: 'charlie@example.com' }
  ],
  'cls-002': [
    { id: 'std-004', name: 'David Williams', grade: 'B', attendance: 85, email: 'david@example.com' },
    { id: 'std-005', name: 'Eva Davis', grade: 'A', attendance: 98, email: 'eva@example.com' },
    { id: 'std-006', name: 'Frank Miller', grade: 'C+', attendance: 78, email: 'frank@example.com' }
  ],
  'cls-003': [
    { id: 'std-007', name: 'Grace Wilson', grade: 'B+', attendance: 90, email: 'grace@example.com' },
    { id: 'std-008', name: 'Henry Lewis', grade: 'A-', attendance: 93, email: 'henry@example.com' },
    { id: 'std-009', name: 'Ivy Clark', grade: 'B', attendance: 89, email: 'ivy@example.com' }
  ]
};

// Mock data for class assignments
interface ClassAssignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'active' | 'upcoming';
  submissions: number;
  avgGrade: number | null;
}

const MOCK_CLASS_ASSIGNMENTS: Record<string, ClassAssignment[]> = {
  'cls-001': [
    { id: 'asg-001', title: 'Algebra Quiz', dueDate: '2023-10-15', status: 'completed', submissions: 32, avgGrade: 88 },
    { id: 'asg-002', title: 'Calculus Homework', dueDate: '2023-10-22', status: 'active', submissions: 28, avgGrade: null }
  ],
  'cls-002': [
    { id: 'asg-003', title: 'Newton\'s Laws Lab', dueDate: '2023-10-18', status: 'active', submissions: 20, avgGrade: null },
    { id: 'asg-004', title: 'Energy Conservation Report', dueDate: '2023-10-25', status: 'upcoming', submissions: 0, avgGrade: null }
  ],
  'cls-003': [
    { id: 'asg-005', title: 'Periodic Table Quiz', dueDate: '2023-10-12', status: 'completed', submissions: 24, avgGrade: 92 },
    { id: 'asg-006', title: 'Acid-Base Reactions Lab', dueDate: '2023-10-20', status: 'active', submissions: 18, avgGrade: null }
  ]
};

// Mock data for attendance records
interface AttendanceRecord {
  date: string;
  present: number;
  absent: number;
  late: number;
}

const MOCK_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  'cls-001': [
    { date: '2023-10-09', present: 30, absent: 1, late: 1 },
    { date: '2023-10-11', present: 31, absent: 0, late: 1 }
  ],
  'cls-002': [
    { date: '2023-10-10', present: 26, absent: 2, late: 0 },
    { date: '2023-10-12', present: 27, absent: 1, late: 0 }
  ],
  'cls-003': [
    { date: '2023-10-09', present: 22, absent: 1, late: 1 },
    { date: '2023-10-13', present: 24, absent: 0, late: 0 }
  ]
};

// Extended mock data for students
const MOCK_TEACHER_STUDENTS: TeacherStudent[] = [
  {
    id: 'std-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    grade: 'A',
    className: 'Grade 10A',
    attendance: 95,
    avgGrade: 'A-',
    lastSubmission: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'std-002',
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    grade: 'B+',
    className: 'Grade 10A',
    attendance: 88,
    avgGrade: 'B+',
    lastSubmission: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'std-003',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    grade: 'C',
    className: 'Grade 10A',
    attendance: 75,
    avgGrade: 'C+',
    lastSubmission: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'std-004',
    name: 'Sarah Davis',
    email: 'sarah.d@example.com',
    grade: 'A+',
    className: 'Grade 9B',
    attendance: 98,
    avgGrade: 'A',
    lastSubmission: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'std-005',
    name: 'David Wilson',
    email: 'david.w@example.com',
    grade: 'B-',
    className: 'Grade 9B',
    attendance: 82,
    avgGrade: 'B-',
    lastSubmission: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'inactive',
  },
];

// Mock attendance data
const MOCK_ATTENDANCE_RECORDS: Attendance[] = [
  {
    id: 'att-001',
    classId: 'cls-001',
    className: 'Advanced Mathematics',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    present: 28,
    absent: 2,
    late: 2,
    total: 32,
    students: [
      { id: 'std-001', name: 'John Smith', status: 'present' },
      { id: 'std-002', name: 'Emma Johnson', status: 'present' },
      { id: 'std-003', name: 'Michael Brown', status: 'absent', note: 'Sick leave' },
      { id: 'std-004', name: 'Sarah Davis', status: 'present' },
      { id: 'std-005', name: 'David Wilson', status: 'late', note: 'Bus delay' }
    ]
  },
  {
    id: 'att-002',
    classId: 'cls-002',
    className: 'Physics Fundamentals',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    present: 25,
    absent: 2,
    late: 1,
    total: 28,
    students: [
      { id: 'std-001', name: 'John Smith', status: 'present' },
      { id: 'std-002', name: 'Emma Johnson', status: 'late', note: 'Dentist appointment' },
      { id: 'std-003', name: 'Michael Brown', status: 'absent', note: 'Family emergency' },
      { id: 'std-004', name: 'Sarah Davis', status: 'present' },
      { id: 'std-005', name: 'David Wilson', status: 'present' }
    ]
  }
];

let MOCK_FEEDBACK: FeedbackItem[] = [
  {
    id: '1',
    courseId: '1',
    courseName: 'Mathematics',
    studentId: '1',
    studentName: 'John Doe',
    type: 'academic',
    content: 'John is performing well in algebra but needs more practice with geometry.',
    rating: 4,
    status: 'reviewed',
    isPrivate: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    courseId: '2',
    courseName: 'Physics',
    studentId: '1',
    studentName: 'John Doe',
    type: 'behavioral',
    content: 'John has been actively participating in class discussions.',
    rating: 5,
    status: 'addressed',
    isPrivate: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    courseId: '3',
    courseName: 'Chemistry',
    studentId: '2',
    studentName: 'Jane Smith',
    type: 'attendance',
    content: 'Jane has been consistently late to class this month.',
    rating: 2,
    status: 'pending',
    isPrivate: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    courseId: '4',
    courseName: 'Biology',
    studentId: '3',
    studentName: 'Alice Johnson',
    type: 'general',
    content: 'Alice shows great potential in scientific research.',
    rating: 5,
    status: 'reviewed',
    isPrivate: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    courseId: '5',
    courseName: 'History',
    studentId: '4',
    studentName: 'Bob Wilson',
    type: 'academic',
    content: 'Bob needs to improve his essay writing skills.',
    rating: 3,
    status: 'addressed',
    isPrivate: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Calculate feedback stats based on current feedback
const calculateFeedbackStats = (): FeedbackStats => {
  const totalFeedback = MOCK_FEEDBACK.length;
  const pendingCount = MOCK_FEEDBACK.filter(f => f.status === 'pending').length;
  const reviewedCount = MOCK_FEEDBACK.filter(f => f.status === 'reviewed').length;
  const addressedCount = MOCK_FEEDBACK.filter(f => f.status === 'addressed').length;
  
  const academicCount = MOCK_FEEDBACK.filter(f => f.type === 'academic').length;
  const behavioralCount = MOCK_FEEDBACK.filter(f => f.type === 'behavioral').length;
  const attendanceCount = MOCK_FEEDBACK.filter(f => f.type === 'attendance').length;
  const generalCount = MOCK_FEEDBACK.filter(f => f.type === 'general').length;
  
  const totalRating = MOCK_FEEDBACK.reduce((sum, item) => sum + (item.rating || 0), 0);
  const avgRating = totalRating / totalFeedback || 0;
  
  return {
    total: totalFeedback,
    pending: pendingCount,
    reviewed: reviewedCount,
    addressed: addressedCount,
    byType: {
      academic: academicCount,
      behavioral: behavioralCount,
      attendance: attendanceCount,
      general: generalCount
    },
    averageRating: avgRating
  };
};

// Calculate mock dashboard stats dynamically instead of using a constant
const calculateMockDashboardStats = (): TeacherDashboardStats => {
  return {
    classes: {
      total: 5,
      active: 3,
      upcoming: 1,
      completed: 1
    },
    students: {
      total: 143,
      averageAttendance: 92,
      averagePerformance: 85
    },
    assignments: {
      total: 15,
      pending: 8,
      graded: 5,
      upcoming: 2
    },
    attendance: {
      today: {
        present: 25,
        absent: 3,
        late: 2,
        total: 30
      },
      weekly: {
        present: 120,
        absent: 10,
        late: 8,
        total: 138
      }
    },
    recentActivity: MOCK_FEEDBACK.slice(0, 3).map(feedback => ({
      id: feedback.id,
      type: 'feedback' as const,
      title: `Feedback Provided`,
      description: feedback.content.substring(0, 50) + (feedback.content.length > 50 ? '...' : ''),
      timestamp: feedback.createdAt,
      studentName: feedback.studentName,
      courseName: feedback.courseName
    }))
  };
};

// Interface for feedback received by the teacher from students
export interface ReceivedFeedbackItem {
  id: string;
  courseId: string;
  courseName: string;
  studentId?: string; // Optional as feedback might be anonymous
  studentName?: string;
  content: string;
  rating: number;
  createdAt: string;
  isAnonymous: boolean;
}

// Mock data for feedback received by teachers (student-to-teacher feedback)
const MOCK_RECEIVED_FEEDBACK: ReceivedFeedbackItem[] = [
  {
    id: 'rf-001',
    courseId: '1',
    courseName: 'Mathematics',
    studentId: '1',
    studentName: 'John Doe',
    content: 'The teacher explains complex concepts clearly and is always available for questions after class. I have learned a lot in this course.',
    rating: 5,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  },
  {
    id: 'rf-002',
    courseId: '1',
    courseName: 'Mathematics',
    studentId: '2',
    studentName: 'Jane Smith',
    content: 'Good teaching style, but sometimes goes too fast through difficult topics. Would appreciate more practice problems.',
    rating: 4,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  },
  {
    id: 'rf-003',
    courseId: '2',
    courseName: 'Physics',
    content: 'Excellent lab demonstrations that help understand theoretical concepts. Very engaging teaching style.',
    rating: 5,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: true
  },
  {
    id: 'rf-004',
    courseId: '3',
    courseName: 'Chemistry',
    studentId: '3',
    studentName: 'Alice Johnson',
    content: 'The course materials are well-organized, but I would like more interactive elements in the lessons.',
    rating: 3.5,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: false
  },
  {
    id: 'rf-005',
    courseId: '5',
    courseName: 'History',
    content: 'The assignments are relevant and challenging. I appreciate the detailed feedback on my work.',
    rating: 4.5,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymous: true
  }
];

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple API configuration without using process.env
const API_BASE_URL = 'http://localhost:3001/api';

// Add helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to handle API errors with improved typing
const handleApiError = <T>(error: Error | unknown, fallbackData: T): T => {
  console.error('API Error:', error);
  
  // Display error toast or message if needed
  if (axios.isAxiosError(error) && error.response) {
    console.error('Server responded with error:', error.response.data);
  } else if (axios.isAxiosError(error) && error.request) {
    console.error('No response from server');
  } else if (error instanceof Error) {
    console.error('Error in request setup:', error.message);
  } else {
    console.error('Unknown error occurred');
  }
  
  // Return mock data as fallback
  console.warn('Using mock data as fallback');
  return fallbackData;
};

// Add API methods to teacherService
export const teacherService = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<TeacherDashboardStats> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/teachers/dashboard-stats');
      
      // Make sure the response data has the expected structure
      const stats = response.data.dashboardStats || {};
      
      // Create default stats to ensure complete structure
      const defaultStats = calculateMockDashboardStats();
      
      // Create a complete stats object with default values for missing properties
      const completeStats: TeacherDashboardStats = {
        classes: {
          total: stats.classes?.total || defaultStats.classes.total,
          active: stats.classes?.active || defaultStats.classes.active,
          upcoming: stats.classes?.upcoming || defaultStats.classes.upcoming,
          completed: stats.classes?.completed || defaultStats.classes.completed
        },
        students: {
          total: stats.students?.total || defaultStats.students.total,
          averageAttendance: stats.students?.averageAttendance || defaultStats.students.averageAttendance,
          averagePerformance: stats.students?.averagePerformance || defaultStats.students.averagePerformance
        },
        assignments: {
          total: stats.assignments?.total || defaultStats.assignments.total,
          pending: stats.assignments?.pending || defaultStats.assignments.pending,
          graded: stats.assignments?.graded || defaultStats.assignments.graded,
          upcoming: stats.assignments?.upcoming || defaultStats.assignments.upcoming
        },
        attendance: {
          today: {
            present: stats.attendance?.today?.present || defaultStats.attendance.today.present,
            absent: stats.attendance?.today?.absent || defaultStats.attendance.today.absent,
            late: stats.attendance?.today?.late || defaultStats.attendance.today.late,
            total: stats.attendance?.today?.total || defaultStats.attendance.today.total
          },
          weekly: {
            present: stats.attendance?.weekly?.present || defaultStats.attendance.weekly.present,
            absent: stats.attendance?.weekly?.absent || defaultStats.attendance.weekly.absent,
            late: stats.attendance?.weekly?.late || defaultStats.attendance.weekly.late,
            total: stats.attendance?.weekly?.total || defaultStats.attendance.weekly.total
          }
        },
        recentActivity: Array.isArray(stats.recentActivity) ? stats.recentActivity : defaultStats.recentActivity
      };
      
      return completeStats;
    } catch (error) {
      // If API call fails, use mock data as fallback
      const mockStats = calculateMockDashboardStats();
      console.error('Using fallback mock data due to API error');
      return handleApiError<TeacherDashboardStats>(error, mockStats);
    }
  },

  /**
   * Get teacher's schedule for a specific day
   */
  getScheduleByDay: async (day: string): Promise<ClassScheduleItem[]> => {
    try {
      // Call the API to get schedule for the specified day
      const response = await api.get(`/teachers/schedule/${day}`);
      
      // Log the exact response for debugging
      console.log('Schedule API response:', JSON.stringify(response.data, null, 2));
      
      // The backend response structure from sendSuccess is:
      // {
      //   error: false,
      //   data: { schedule: [...] },
      //   message: "Teacher schedule retrieved successfully"
      // }
      
      let scheduleData: any[] = [];
      
      if (response.data) {
        // First check for the standard API response format we're now receiving
        if (response.data.error === false && 
            response.data.data && 
            Array.isArray(response.data.data.schedule)) {
          scheduleData = response.data.data.schedule;
        }
        // Fallback cases for other possible response formats
        else if (response.data.data && response.data.data.schedule && Array.isArray(response.data.data.schedule)) {
          scheduleData = response.data.data.schedule;
        } 
        else if (response.data.schedule && Array.isArray(response.data.schedule)) {
          scheduleData = response.data.schedule;
        } else if (Array.isArray(response.data)) {
          scheduleData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          scheduleData = response.data.data;
        }
      }
      
      // Only log a warning if we couldn't extract schedule data when we should have data
      if (scheduleData.length === 0 && response.data && !response.data.message?.includes('success')) {
        console.warn('Invalid schedule data format from API:', response.data);
      }
      
      // Validate and transform each schedule item
      return scheduleData
        .filter((item: any) => item && typeof item === 'object')
        .map((item: any) => ({
          classId: item.classId || 'unknown',
          className: item.className || 'Unknown Class',
          courseName: item.courseName || 'Unknown Course',
          room: item.room || 'TBD',
          startTime: item.startTime || '',
          endTime: item.endTime || '',
          studentCount: item.studentCount || 0
        }))
        .sort((a: ClassScheduleItem, b: ClassScheduleItem) => {
          // Sort by start time if available
          if (a.startTime && b.startTime) {
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
          }
          return 0;
        });
    } catch (error) {
      console.error('Error fetching schedule:', error);
      
      // Simulate API delay
      await delay(600);
      
      // Calculate the current day's mock schedule (filter the mock data by day)
      const dayLower = day.toLowerCase();
      const scheduleItems = Object.values(MOCK_CLASSES)
        .flatMap(cls => {
          // Get schedule items for this day
          const daySchedules = cls.schedule
            .filter(s => s.day.toLowerCase() === dayLower)
            .map(s => ({
              classId: cls.id,
              className: cls.name,
              courseName: cls.courseName || 'Course Name',
              room: cls.room,
              startTime: s.startTime,
              endTime: s.endTime,
              studentCount: cls.studentCount
            }));
          
          return daySchedules;
        })
        .sort((a: ClassScheduleItem, b: ClassScheduleItem) => {
          const timeA = a.startTime.split(':').map(Number);
          const timeB = b.startTime.split(':').map(Number);
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
      
      return handleApiError(error, scheduleItems);
    }
  },
  
  /**
   * Get all students
   */
  getStudents: async (): Promise<Student[]> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/teachers/students');
      return response.data.students;
    } catch (error) {
      // If API call fails, use mock data as fallback
      await delay(800);
      return handleApiError<Student[]>(error, [...MOCK_STUDENTS]);
    }
  },

  /**
   * Get detailed information about all students
   */
  getAllStudents: async (): Promise<TeacherStudent[]> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/teachers/students');
      
      // Transform API response to match TeacherStudent interface
      return response.data.students.map((student: {
        id: string;
        name: string;
        profileImage?: string;
        email?: string;
        grade?: string;
        className?: string;
        attendance?: number;
        performanceScore?: number;
        lastActivity?: string;
      }) => ({
        id: student.id,
        name: student.name,
        profileImage: student.profileImage,
        email: student.email || 'N/A',
        grade: student.grade || 'N/A',
        className: student.className || 'N/A',
        attendance: student.attendance || 0,
        avgGrade: student.performanceScore || 'N/A',
        lastSubmission: student.lastActivity,
        status: 'active' // Default value
      }));
    } catch (error) {
      // If API call fails, use mock data as fallback
      await delay(1000);
      return handleApiError<TeacherStudent[]>(error, [...MOCK_TEACHER_STUDENTS]);
    }
  },
  
  /**
   * Get all courses taught by the teacher
   */
  getCourses: async (): Promise<Course[]> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/teachers/courses');
      return response.data.courses;
    } catch (error) {
      // If API call fails, use mock data as fallback
      await delay(600);
      return handleApiError<Course[]>(error, [...MOCK_COURSES]);
    }
  },
  
  /**
   * Get all feedback provided by the teacher
   */
  getFeedback: async (): Promise<FeedbackItem[]> => {
    // Simulate API call delay
    await delay(1000);
    return [...MOCK_FEEDBACK];
  },
  
  /**
   * Get statistics about the feedback provided
   */
  getFeedbackStats: async (): Promise<FeedbackStats> => {
    // Simulate API call delay
    await delay(700);
    return calculateFeedbackStats();
  },
  
  /**
   * Create a new feedback entry
   */
  createFeedback: async (feedback: NewFeedback): Promise<FeedbackItem> => {
    // Simulate API call delay
    await delay(1500);
    
    // Find the related student and course for display names
    const student = MOCK_STUDENTS.find(s => s.id === feedback.studentId);
    const course = MOCK_COURSES.find(c => c.id === feedback.courseId);
    
    if (!student || !course) {
      throw new Error('Invalid student or course ID');
    }
    
    const newFeedback: FeedbackItem = {
      id: (MOCK_FEEDBACK.length + 1).toString(),
      courseId: feedback.courseId,
      courseName: course.name,
      studentId: feedback.studentId,
      studentName: student.name,
      type: feedback.type,
      content: feedback.content,
      rating: feedback.rating,
      status: 'pending',
      isPrivate: feedback.isPrivate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock data
    MOCK_FEEDBACK = [...MOCK_FEEDBACK, newFeedback];
    
    return newFeedback;
  },
  
  /**
   * Update the status of a feedback item
   */
  updateFeedbackStatus: async (feedbackId: string, newStatus: FeedbackItem['status']): Promise<FeedbackItem> => {
    // Simulate API call delay
    await delay(800);
    
    // Find the feedback item to update
    const feedbackIndex = MOCK_FEEDBACK.findIndex(f => f.id === feedbackId);
    
    if (feedbackIndex === -1) {
      throw new Error(`Feedback with ID ${feedbackId} not found`);
    }
    
    // Update the status
    const updatedFeedback = {
      ...MOCK_FEEDBACK[feedbackIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    // Update the mock data
    MOCK_FEEDBACK[feedbackIndex] = updatedFeedback;
    
    return updatedFeedback;
  },

  /**
   * Get all attendance records
   */
  getAttendanceRecords: async (): Promise<Attendance[]> => {
    // Simulate API call delay
    await delay(1000);
    return [...MOCK_ATTENDANCE_RECORDS];
  },

  /**
   * Get attendance record by ID
   */
  getAttendanceById: async (id: string): Promise<Attendance | null> => {
    // Simulate API call delay
    await delay(600);
    return MOCK_ATTENDANCE_RECORDS.find(record => record.id === id) || null;
  },

  /**
   * Submit a new attendance record
   */
  submitAttendanceRecord: async (classId: string, data: Omit<Attendance, 'id' | 'classId'>): Promise<Attendance> => {
    // Simulate API call delay
    await delay(1200);
    
    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      classId,
      ...data
    };
    
    // In a real implementation, we would save this to a database
    
    return newRecord;
  },

  /**
   * Get all classes for the teacher
   */
  getClasses: async (): Promise<TeacherClass[]> => {
    // Simulate API call delay
    await delay(800);
    return [...MOCK_CLASSES];
  },

  /**
   * Get students in a specific class
   */
  getClassStudents: async (classId: string): Promise<ClassStudent[]> => {
    // Simulate API call delay
    await delay(700);
    return MOCK_CLASS_STUDENTS[classId] || [];
  },

  /**
   * Update class details
   */
  updateClass: async (classId: string, updates: Partial<TeacherClass>): Promise<TeacherClass> => {
    // Simulate API delay
    await delay(1000);
    
    // Find the class to update
    const classIndex = MOCK_CLASSES.findIndex(c => c.id === classId);
    
    if (classIndex === -1) {
      throw new Error(`Class with ID ${classId} not found`);
    }
    
    // Update the class in our mock data
    const updatedClass = {
      ...MOCK_CLASSES[classIndex],
      ...updates
    };
    
    MOCK_CLASSES[classIndex] = updatedClass;
    
    return { ...updatedClass };
  },

  /**
   * Get assignments for a specific class
   */
  getClassAssignments: async (classId: string): Promise<ClassAssignment[]> => {
    // Simulate API delay
    await delay(800);
    return MOCK_CLASS_ASSIGNMENTS[classId] || [];
  },

  /**
   * Submit attendance for a class
   */
  submitAttendance: async (classId: string, date: string, attendance: Record<string, 'present' | 'absent' | 'late'>): Promise<void> => {
    // Simulate API delay
    await delay(1200);
    
    // In a real implementation, we would save this data
    console.log(`Submitting attendance for class ${classId} on ${date}:`, attendance);
    
    // For mock purposes, we'll add a basic attendance record
    if (!MOCK_ATTENDANCE[classId]) {
      MOCK_ATTENDANCE[classId] = [];
    }
    
    // Count attendance stats
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    
    // Add new attendance record
    MOCK_ATTENDANCE[classId].push({ date, present, absent, late });
  },

  /**
   * Get attendance records for a class
   */
  getClassAttendance: async (classId: string): Promise<AttendanceRecord[]> => {
    // Simulate API delay
    await delay(700);
    
    // Return all attendance records for this class
    return MOCK_ATTENDANCE[classId] || [];
  },

  // Add a method to check API connection status
  checkApiConnection: async (): Promise<boolean> => {
    try {
      await api.get('/teachers/dashboard-stats');
      return true;
    } catch (error) {
      console.warn('API connection failed:', error);
      return false;
    }
  },

  /**
   * Get feedback that has been received by the teacher
   */
  getReceivedFeedback: async (): Promise<ReceivedFeedbackItem[]> => {
    try {
      // Try to fetch from API first
      const response = await api.get('/teachers/received-feedback');
      
      // Check if the response has the expected format
      if (response.data && response.data.data && Array.isArray(response.data.data.feedback)) {
        return response.data.data.feedback;
      } else if (response.data && Array.isArray(response.data.feedback)) {
        return response.data.feedback;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('Invalid feedback data format from API');
      throw new Error('Invalid feedback data format');
    } catch (error) {
      // If API call fails, use mock data as fallback
      await delay(800);
      return handleApiError<ReceivedFeedbackItem[]>(error, [...MOCK_RECEIVED_FEEDBACK]);
    }
  }
}; 