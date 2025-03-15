import axios from 'axios';


interface Child {
  id: string;
  name: string;
  grade: string;
  profileImage?: string;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  grade: string | number;
  lastActivity: string;
  teacher: string;
}

interface RecentActivity {
  id: string;
  type: 'assignment' | 'attendance' | 'grade' | 'behavior' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: 'positive' | 'negative' | 'neutral';
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'assignment' | 'event' | 'holiday';
}

interface ChildMonitoringData {
  child: Child;
  attendance: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
  courseProgress: CourseProgress[];
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];
  performanceTrend: {
    subject: string;
    currentGrade: number;
    previousGrade: number;
    changeDirection: 'up' | 'down' | 'stable';
  }[];
}

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  courseId: string;
  courseName: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timeIn?: string;
  timeOut?: string;
  notes?: string;
}

// Mock data for parent's children
const MOCK_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Emma Johnson',
    grade: 'Grade 10',
    profileImage: 'https://i.pravatar.cc/150?img=32'
  },
  {
    id: '2',
    name: 'Noah Johnson',
    grade: 'Grade 8',
    profileImage: 'https://i.pravatar.cc/150?img=51'
  }
];

// Mock monitoring data for each child
const MOCK_MONITORING_DATA: Record<string, ChildMonitoringData> = {
  '1': {
    child: MOCK_CHILDREN[0],
    attendance: {
      present: 42,
      absent: 3,
      late: 5,
      excused: 2,
      total: 52
    },
    courseProgress: [
      {
        courseId: '1',
        courseName: 'Mathematics',
        progress: 85,
        grade: 'B+',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Mr. Anderson'
      },
      {
        courseId: '2',
        courseName: 'Physics',
        progress: 78,
        grade: 'B',
        lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Ms. Thompson'
      },
      {
        courseId: '3',
        courseName: 'Chemistry',
        progress: 92,
        grade: 'A-',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Dr. Wilson'
      },
      {
        courseId: '4',
        courseName: 'English Literature',
        progress: 95,
        grade: 'A',
        lastActivity: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Mrs. Davis'
      }
    ],
    recentActivities: [
      {
        id: '1',
        type: 'grade',
        title: 'Physics Quiz Graded',
        description: 'Emma scored 85% on the latest Physics quiz.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'positive'
      },
      {
        id: '2',
        type: 'assignment',
        title: 'English Essay Submitted',
        description: 'Emma submitted the essay on Shakespeare\'s Macbeth.',
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'positive'
      },
      {
        id: '3',
        type: 'attendance',
        title: 'Late to Class',
        description: 'Emma was 10 minutes late to Chemistry class.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'negative'
      },
      {
        id: '4',
        type: 'behavior',
        title: 'Excellent Participation',
        description: 'Emma actively participated in the class debate.',
        timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'positive'
      },
      {
        id: '5',
        type: 'payment',
        title: 'Field Trip Payment Due',
        description: 'Payment for the science museum field trip is due next week.',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'neutral'
      }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Mathematics Mid-term Exam',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'exam'
      },
      {
        id: '2',
        title: 'Science Project Deadline',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'assignment'
      },
      {
        id: '3',
        title: 'Parent-Teacher Conference',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'event'
      },
      {
        id: '4',
        title: 'Spring Break',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'holiday'
      }
    ],
    performanceTrend: [
      {
        subject: 'Mathematics',
        currentGrade: 87,
        previousGrade: 82,
        changeDirection: 'up'
      },
      {
        subject: 'Physics',
        currentGrade: 78,
        previousGrade: 75,
        changeDirection: 'up'
      },
      {
        subject: 'Chemistry',
        currentGrade: 92,
        previousGrade: 94,
        changeDirection: 'down'
      },
      {
        subject: 'English Literature',
        currentGrade: 95,
        previousGrade: 95,
        changeDirection: 'stable'
      }
    ]
  },
  '2': {
    child: MOCK_CHILDREN[1],
    attendance: {
      present: 48,
      absent: 2,
      late: 1,
      excused: 1,
      total: 52
    },
    courseProgress: [
      {
        courseId: '5',
        courseName: 'Mathematics',
        progress: 72,
        grade: 'C+',
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Mr. Anderson'
      },
      {
        courseId: '6',
        courseName: 'Science',
        progress: 85,
        grade: 'B',
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Ms. Garcia'
      },
      {
        courseId: '7',
        courseName: 'History',
        progress: 90,
        grade: 'A-',
        lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Mr. Roberts'
      },
      {
        courseId: '8',
        courseName: 'Art',
        progress: 95,
        grade: 'A',
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        teacher: 'Mrs. Miller'
      }
    ],
    recentActivities: [
      {
        id: '6',
        type: 'grade',
        title: 'Science Project Graded',
        description: 'Noah received an A on his volcano project.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'positive'
      },
      {
        id: '7',
        type: 'assignment',
        title: 'Math Homework Missing',
        description: 'Noah did not turn in the math homework due yesterday.',
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'negative'
      },
      {
        id: '8',
        type: 'behavior',
        title: 'Helped Classmate',
        description: 'Noah helped a classmate understand the history assignment.',
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'positive'
      },
      {
        id: '9',
        type: 'attendance',
        title: 'Absent - Doctor Appointment',
        description: 'Noah was absent due to a scheduled doctor appointment.',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'neutral'
      }
    ],
    upcomingEvents: [
      {
        id: '5',
        title: 'Science Quiz',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'exam'
      },
      {
        id: '6',
        title: 'History Essay Due',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'assignment'
      },
      {
        id: '7',
        title: 'School Play',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'event'
      }
    ],
    performanceTrend: [
      {
        subject: 'Mathematics',
        currentGrade: 72,
        previousGrade: 68,
        changeDirection: 'up'
      },
      {
        subject: 'Science',
        currentGrade: 85,
        previousGrade: 83,
        changeDirection: 'up'
      },
      {
        subject: 'History',
        currentGrade: 90,
        previousGrade: 92,
        changeDirection: 'down'
      },
      {
        subject: 'Art',
        currentGrade: 95,
        previousGrade: 95,
        changeDirection: 'stable'
      }
    ]
  }
};

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API response type
interface ApiResponse<T> {
  error: boolean;
  data: T;
  message: string;
}

// Additional interfaces for payments
interface Payment {
  id: string;
  childId: string;
  childName: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  transactionId?: string;
  paymentDate?: string;
  paymentMethod?: string;
  invoiceUrl?: string;
}

// Interface for documents
interface Document {
  id: string;
  childId?: string;
  childName?: string;
  title: string;
  type: 'report_card' | 'permission_slip' | 'newsletter' | 'calendar' | 'curriculum' | 'other';
  uploadDate: string;
  size: number;
  fileUrl: string;
  isNew?: boolean;
  requiresSignature?: boolean;
  signatureStatus?: 'signed' | 'pending' | 'not_required';
}

// Interface for feedback
interface FeedbackItem {
  id: string;
  childId?: string;
  childName?: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  category: 'academic' | 'behavior' | 'attendance' | 'general';
  priority?: 'high' | 'medium' | 'low';
  responseRequired?: boolean;
  responseId?: string;
}

interface FeedbackResponse {
  id: string;
  feedbackId: string;
  responderId: string;
  responderName: string;
  responderRole: 'parent' | 'teacher' | 'administrator';
  message: string;
  date: string;
  isRead: boolean;
}

// Helper to check online status and log appropriately
const checkOnlineStatus = (context: string): boolean => {
  const isOnline = navigator.onLine;
  if (!isOnline) {
    console.error(`[PARENT-SERVICE] ${context} - Browser is offline. Using fallback data.`);
  }
  return isOnline;
};

/**
 * Helper function for consistent error logging and handling
 * @param context The method or operation where error occurred
 * @param error The error object
 * @param fallback Optional fallback data to return
 */
const handleApiError = <T>(context: string, error: any, fallback?: T): T => {
  // Log detailed error information to console for debugging
  console.error(`[PARENT-SERVICE] ${context} - API Error:`, error);
  
  // Log specific error details if available
  if (error.response) {
    console.error(`[PARENT-SERVICE] ${context} - Status:`, error.response.status);
    console.error(`[PARENT-SERVICE] ${context} - Response Data:`, error.response.data);
  } else if (error.request) {
    console.error(`[PARENT-SERVICE] ${context} - No Response:`, error.request);
  } else {
    console.error(`[PARENT-SERVICE] ${context} - Error Message:`, error.message);
  }
  
  // Additional context about the error
  console.error(`[PARENT-SERVICE] ${context} - Using fallback data:`, !!fallback);
  
  // Re-throw if no fallback provided, otherwise return fallback data
  if (fallback === undefined) {
    throw error;
  }
  
  return fallback as T;
};

// Enhanced error handler for network connection issues
const handleNetworkError = <T>(context: string, error: any, fallback?: T): T => {
  console.error(`[PARENT-SERVICE] ${context} - Network connection error:`, error);
  
  // Check if it's a network connectivity issue
  if (error.message && (
    error.message.includes('Network Error') || 
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed')
  )) {
    console.error(`[PARENT-SERVICE] ${context} - This appears to be a network connectivity issue. The server might be down or unreachable.`);
  }
  
  // Check for CORS issues
  if (error.message && error.message.includes('CORS')) {
    console.error(`[PARENT-SERVICE] ${context} - This appears to be a CORS issue. Check server CORS configuration.`);
  }
  
  // Log URL that failed if available
  if (error.config && error.config.url) {
    console.error(`[PARENT-SERVICE] ${context} - Failed request URL:`, error.config.url);
  }
  
  // Additional context about the error
  console.error(`[PARENT-SERVICE] ${context} - Using fallback data:`, !!fallback);
  
  // Re-throw if no fallback provided, otherwise return fallback data
  if (fallback === undefined) {
    throw error;
  }
  
  return fallback as T;
};

/**
 * Parent Service for managing parent-related operations
 */
export const parentService = {
  /**
   * Get all children of the parent
   */
  async getChildren() {
    console.log('[PARENT-SERVICE] getChildren - Fetching children');
    try {
      // Check online status first
      if (!checkOnlineStatus('getChildren')) {
        return MOCK_CHILDREN;
      }
      
      const response = await axios.get('/api/parent/children');
      console.log('[PARENT-SERVICE] getChildren - Success:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      return handleApiError('getChildren', error, MOCK_CHILDREN);
    }
  },
  
  /**
   * Get monitoring data for a specific child
   */
  async getChildMonitoringData(childId: string): Promise<ChildMonitoringData> {
    console.log('[PARENT-SERVICE] getChildMonitoringData - Fetching for child:', childId);
    try {
      const { data } = await axios.get<ApiResponse<ChildMonitoringData>>(`/api/parent/child/${childId}/monitoring`);
      console.log('[PARENT-SERVICE] getChildMonitoringData - Success');
      return data.data;
    } catch (error) {
      return handleApiError('getChildMonitoringData', error, MOCK_MONITORING_DATA[childId] || MOCK_MONITORING_DATA['1']);
    }
  },

  /**
   * Get attendance records for all children of the parent
   */
  async getChildrenAttendance(filters?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
  }): Promise<AttendanceRecord[]> {
    console.log('[PARENT-SERVICE] getChildrenAttendance - Fetching attendance with options:', filters);
    try {
      const { data } = await axios.get<ApiResponse<AttendanceRecord[]>>('/api/parent/children/attendance', { 
        params: filters
      });
      console.log('[PARENT-SERVICE] getChildrenAttendance - Success:', data.data.length, 'records');
      return data.data;
    } catch (error) {
      return handleApiError('getChildrenAttendance', error, []);
    }
  },
  
  /**
   * Get attendance records for a specific child
   */
  async getChildAttendance(childId: string, filters?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
  }): Promise<AttendanceRecord[]> {
    console.log('[PARENT-SERVICE] getChildAttendance - Fetching attendance for child:', childId, 'with options:', filters);
    try {
      const { data } = await axios.get<ApiResponse<AttendanceRecord[]>>(`/api/parent/child/${childId}/attendance`, { 
        params: filters
      });
      console.log('[PARENT-SERVICE] getChildAttendance - Success:', data.data.length, 'records');
      return data.data;
    } catch (error) {
      return handleApiError('getChildAttendance', error, []);
    }
  },
  
  /**
   * Get attendance statistics for all children of the parent
   */
  async getChildrenAttendanceStats(): Promise<{
    childId: string;
    childName: string;
    stats: {
      totalClasses: number;
      presentCount: number;
      absentCount: number;
      lateCount: number;
      excusedCount: number;
      attendanceRate: number;
    }
  }[]> {
    console.log('[PARENT-SERVICE] getChildrenAttendanceStats - Fetching stats');
    try {
      const { data } = await axios.get<ApiResponse<{
        childId: string;
        childName: string;
        stats: {
          totalClasses: number;
          presentCount: number;
          absentCount: number;
          lateCount: number;
          excusedCount: number;
          attendanceRate: number;
        }
      }[]>>('/api/parent/children/attendance/stats');
      console.log('[PARENT-SERVICE] getChildrenAttendanceStats - Success:', data.data);
      return data.data;
    } catch (error) {
      return handleApiError('getChildrenAttendanceStats', error, []);
    }
  },

  /**
   * Get payment information for all children of the parent
   */
  async getPayments(filters?: {
    startDate?: string;
    endDate?: string;
    status?: 'paid' | 'pending' | 'overdue';
    childId?: string;
  }): Promise<Payment[]> {
    console.log('[PARENT-SERVICE] getPayments - Fetching with options:', filters);
    try {
      const { data } = await axios.get<ApiResponse<Payment[]>>('/api/parent/payments', { 
        params: filters
      });
      console.log('[PARENT-SERVICE] getPayments - Success:', data.data.length, 'payments');
      return data.data;
    } catch (error) {
      return handleApiError('getPayments', error, []);
    }
  },

  /**
   * Pay for a specific payment
   */
  async makePayment(paymentId: string, paymentDetails: {
    amount: number;
    paymentMethod: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    paymentDate?: string;
    message: string;
  }> {
    console.log('[PARENT-SERVICE] makePayment - Making payment for:', paymentId, 'with details:', paymentDetails);
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        transactionId?: string;
        paymentDate?: string;
        message: string;
      }>>(`/api/parent/payments/${paymentId}/pay`, paymentDetails);
      console.log('[PARENT-SERVICE] makePayment - Success:', data);
      return data.data;
    } catch (error) {
      return handleApiError('makePayment', error);
    }
  },

  /**
   * Get documents for children of the parent
   */
  async getDocuments(filters?: {
    childId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Document[]> {
    console.log('[PARENT-SERVICE] getDocuments - Fetching with options:', filters);
    try {
      // Check online status first
      if (!checkOnlineStatus('getDocuments')) {
        return [
          {
            id: "d1",
            childId: "1",
            childName: "Emma Johnson",
            title: "Report Card - Q1",
            type: "report_card",
            uploadDate: "2023-11-15",
            size: 1250000,
            fileUrl: "/mock/reports/report-q1.pdf",
            isNew: false,
            requiresSignature: true,
            signatureStatus: "signed"
          },
          {
            id: "d2",
            childId: "1",
            childName: "Emma Johnson",
            title: "Field Trip Permission Slip",
            type: "permission_slip",
            uploadDate: "2023-12-01",
            size: 850000,
            fileUrl: "/mock/forms/field-trip.pdf",
            isNew: true,
            requiresSignature: true,
            signatureStatus: "pending"
          },
          {
            id: "d3",
            childId: "2",
            childName: "Noah Johnson",
            title: "School Newsletter - December",
            type: "newsletter",
            uploadDate: "2023-12-05",
            size: 2500000,
            fileUrl: "/mock/newsletter/dec-2023.pdf",
            isNew: true,
            requiresSignature: false
          }
        ];
      }
      
      const { data } = await axios.get<ApiResponse<Document[]>>('/api/parent/documents', { 
        params: filters
      });
      console.log('[PARENT-SERVICE] getDocuments - Success:', data.data.length, 'documents');
      return data.data;
    } catch (error: any) {
      return handleApiError('getDocuments', error, [
        {
          id: "d1",
          childId: "1", 
          childName: "Emma Johnson",
          title: "Report Card - Q1",
          type: "report_card",
          uploadDate: "2023-11-15",
          size: 1250000,
          fileUrl: "/mock/reports/report-q1.pdf",
          isNew: false,
          requiresSignature: true,
          signatureStatus: "signed"
        },
        {
          id: "d2",
          childId: "1",
          childName: "Emma Johnson",
          title: "Field Trip Permission Slip",
          type: "permission_slip",
          uploadDate: "2023-12-01",
          size: 850000,
          fileUrl: "/mock/forms/field-trip.pdf",
          isNew: true,
          requiresSignature: true,
          signatureStatus: "pending"
        },
        {
          id: "d3",
          childId: "2",
          childName: "Noah Johnson",
          title: "School Newsletter - December",
          type: "newsletter",
          uploadDate: "2023-12-05",
          size: 2500000,
          fileUrl: "/mock/newsletter/dec-2023.pdf",
          isNew: true,
          requiresSignature: false
        }
      ]);
    }
  },

  /**
   * Download a document
   */
  async downloadDocument(documentId: string): Promise<Blob> {
    console.log('[PARENT-SERVICE] downloadDocument - Downloading document:', documentId);
    try {
      const response = await axios.get<Blob>(`/api/parent/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      console.log('[PARENT-SERVICE] downloadDocument - Success');
      return response.data;
    } catch (error) {
      return handleApiError('downloadDocument', error);
    }
  },

  /**
   * Sign a document
   */
  async signDocument(documentId: string, signature: {
    signatureData: string;
    signatureDate: string;
  }): Promise<{
    success: boolean;
    signatureId?: string;
    message: string;
  }> {
    console.log('[PARENT-SERVICE] signDocument - Signing document:', documentId, 'with data:', signature);
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        signatureId?: string;
        message: string;
      }>>(`/api/parent/documents/${documentId}/sign`, signature);
      console.log('[PARENT-SERVICE] signDocument - Success:', data);
      return data.data;
    } catch (error) {
      return handleApiError('signDocument', error);
    }
  },

  /**
   * Get feedback messages for children of the parent
   */
  async getFeedback(filters?: {
    childId?: string;
    startDate?: string;
    endDate?: string;
    isRead?: boolean;
    category?: 'academic' | 'behavior' | 'attendance' | 'general';
  }): Promise<FeedbackItem[]> {
    console.log('[PARENT-SERVICE] getFeedback - Fetching with options:', filters);
    try {
      // Log the request URL for debugging
      const requestUrl = '/api/parent/feedback';
      console.log(`[PARENT-SERVICE] getFeedback - Request URL: ${requestUrl}`, { params: filters });
      
      // Check online status first
      if (!checkOnlineStatus('getFeedback')) {
        return [
          {
            id: "f1",
            childId: "1",
            childName: "Emma Johnson",
            teacherId: "t1",
            teacherName: "Mr. Anderson",
            subject: "Mathematics Performance",
            message: "Emma has shown great improvement in her calculus skills this month. Keep encouraging her practice at home.",
            date: "2023-03-18",
            isRead: false,
            category: "academic",
            priority: "medium"
          },
          {
            id: "f2",
            childId: "1",
            childName: "Emma Johnson",
            teacherId: "t2",
            teacherName: "Ms. Thompson",
            subject: "Late Arrival Notice",
            message: "Emma was 15 minutes late to class today. Please ensure she arrives on time for morning classes.",
            date: "2023-03-15",
            isRead: true,
            category: "attendance",
            priority: "high",
            responseRequired: true
          },
          {
            id: "f3",
            childId: "2",
            childName: "Noah Johnson",
            teacherId: "t3",
            teacherName: "Mr. Roberts",
            subject: "History Project Excellence",
            message: "Noah's history project on Ancient Egypt was exceptional. He demonstrated great research skills and creativity.",
            date: "2023-03-10",
            isRead: true,
            category: "academic",
            priority: "medium"
          }
        ];
      }
      
      const { data } = await axios.get<ApiResponse<FeedbackItem[]>>(requestUrl, { 
        params: filters
      });
      console.log('[PARENT-SERVICE] getFeedback - Success:', data.data.length, 'feedback items');
      return data.data;
    } catch (error: any) {
      // Check for specific error types
      if (axios.isCancel(error)) {
        console.error('[PARENT-SERVICE] getFeedback - Request was cancelled');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`[PARENT-SERVICE] getFeedback - Server responded with error ${error.response.status}:`, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[PARENT-SERVICE] getFeedback - No response received from server');
      }
      
      return handleApiError('getFeedback', error, [
        {
          id: "f1",
          childId: "1",
          childName: "Emma Johnson",
          teacherId: "t1",
          teacherName: "Mr. Anderson",
          subject: "Mathematics Performance",
          message: "Emma has shown great improvement in her calculus skills this month. Keep encouraging her practice at home.",
          date: "2023-03-18",
          isRead: false,
          category: "academic",
          priority: "medium"
        },
        {
          id: "f2",
          childId: "1",
          childName: "Emma Johnson",
          teacherId: "t2",
          teacherName: "Ms. Thompson",
          subject: "Late Arrival Notice",
          message: "Emma was 15 minutes late to class today. Please ensure she arrives on time for morning classes.",
          date: "2023-03-15",
          isRead: true,
          category: "attendance",
          priority: "high",
          responseRequired: true
        },
        {
          id: "f3",
          childId: "2",
          childName: "Noah Johnson",
          teacherId: "t3",
          teacherName: "Mr. Roberts",
          subject: "History Project Excellence",
          message: "Noah's history project on Ancient Egypt was exceptional. He demonstrated great research skills and creativity.",
          date: "2023-03-10",
          isRead: true,
          category: "academic",
          priority: "medium"
        }
      ]);
    }
  },

  /**
   * Get responses for a specific feedback message
   */
  async getFeedbackResponses(feedbackId: string): Promise<FeedbackResponse[]> {
    console.log('[PARENT-SERVICE] getFeedbackResponses - Fetching for feedback:', feedbackId);
    try {
      // Log the request URL for debugging
      const requestUrl = `/api/parent/feedback/${feedbackId}/responses`;
      console.log(`[PARENT-SERVICE] getFeedbackResponses - Request URL: ${requestUrl}`);
      
      // Check online status first
      if (!checkOnlineStatus('getFeedbackResponses')) {
        return [
          {
            id: "r1",
            feedbackId: feedbackId,
            responderId: "p1",
            responderName: "Mrs. Johnson",
            responderRole: "parent",
            message: "Thank you for letting me know. I'll make sure this is addressed at home.",
            date: "2023-03-15T14:30:00Z",
            isRead: true
          }
        ];
      }
      
      const { data } = await axios.get<ApiResponse<FeedbackResponse[]>>(requestUrl);
      console.log('[PARENT-SERVICE] getFeedbackResponses - Success:', data.data.length, 'responses');
      return data.data;
    } catch (error: any) {
      return handleApiError('getFeedbackResponses', error, [
        {
          id: "r1",
          feedbackId: feedbackId,
          responderId: "p1",
          responderName: "Mrs. Johnson",
          responderRole: "parent",
          message: "Thank you for letting me know. I'll make sure this is addressed at home.",
          date: "2023-03-15T14:30:00Z",
          isRead: true
        }
      ]);
    }
  },

  /**
   * Send response to a feedback message
   */
  async respondToFeedback(feedbackId: string, response: {
    message: string;
  }): Promise<{
    success: boolean;
    responseId?: string;
    message: string;
  }> {
    console.log('[PARENT-SERVICE] respondToFeedback - Responding to feedback:', feedbackId, 'with message:', response);
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        responseId?: string;
        message: string;
      }>>(`/api/parent/feedback/${feedbackId}/respond`, response);
      console.log('[PARENT-SERVICE] respondToFeedback - Success:', data);
      return data.data;
    } catch (error) {
      return handleApiError('respondToFeedback', error);
    }
  },

  /**
   * Mark feedback as read
   */
  async markFeedbackAsRead(feedbackId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log('[PARENT-SERVICE] markFeedbackAsRead - Marking feedback as read:', feedbackId);
    try {
      const { data } = await axios.put<ApiResponse<{
        success: boolean;
        message: string;
      }>>(`/api/parent/feedback/${feedbackId}/read`);
      console.log('[PARENT-SERVICE] markFeedbackAsRead - Success:', data);
      return data.data;
    } catch (error) {
      return handleApiError('markFeedbackAsRead', error);
    }
  },
}; 