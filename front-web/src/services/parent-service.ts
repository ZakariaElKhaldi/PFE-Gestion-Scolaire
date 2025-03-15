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

/**
 * Parent Service for managing parent-related operations
 */
export const parentService = {
  /**
   * Get all children of the parent
   */
  getChildren: async (): Promise<Child[]> => {
    try {
      const { data } = await axios.get<ApiResponse<Child[]>>('/api/parent/children');
      return data.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      // Fallback to mock data if API fails
      await delay(800);
      return [...MOCK_CHILDREN];
    }
  },
  
  /**
   * Get monitoring data for a specific child
   */
  getChildMonitoringData: async (childId: string): Promise<ChildMonitoringData> => {
    try {
      const { data } = await axios.get<ApiResponse<ChildMonitoringData>>(`/api/parent/child/${childId}/monitoring`);
      return data.data;
    } catch (error) {
      console.error(`Error fetching monitoring data for child ${childId}:`, error);
      // Fallback to mock data if API fails
      await delay(1200);
      
      const data = MOCK_MONITORING_DATA[childId];
      
      if (!data) {
        throw new Error('Child not found');
      }
      
      return data;
    }
  },

  /**
   * Get attendance records for all children of the parent
   */
  getChildrenAttendance: async (filters?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
  }): Promise<AttendanceRecord[]> => {
    try {
      const { data } = await axios.get<ApiResponse<AttendanceRecord[]>>('/api/parent/children/attendance', { 
        params: filters
      });
      return data.data;
    } catch (error) {
      console.error('Error fetching children attendance:', error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return mock data for now
      return [
        {
          id: "a1",
          studentId: "1",
          studentName: "Emma Johnson",
          date: "2023-03-01",
          courseId: "c1",
          courseName: "Mathematics 101",
          status: "present",
          timeIn: "09:00",
          timeOut: "10:30",
          notes: "Active participation in class"
        },
        {
          id: "a2",
          studentId: "1",
          studentName: "Emma Johnson",
          date: "2023-03-02",
          courseId: "c2",
          courseName: "Physics 201",
          status: "late",
          timeIn: "10:15",
          timeOut: "11:45",
          notes: "Arrived 15 minutes late"
        },
        {
          id: "a3",
          studentId: "2",
          studentName: "Noah Johnson",
          date: "2023-03-01",
          courseId: "c1",
          courseName: "Mathematics 101",
          status: "present",
          timeIn: "09:00",
          timeOut: "10:30"
        },
        {
          id: "a4",
          studentId: "2",
          studentName: "Noah Johnson",
          date: "2023-03-02",
          courseId: "c2",
          courseName: "Physics 201",
          status: "absent",
          notes: "Medical appointment"
        }
      ];
    }
  },
  
  /**
   * Get attendance records for a specific child
   */
  getChildAttendance: async (childId: string, filters?: {
    startDate?: string;
    endDate?: string;
    courseId?: string;
    status?: 'present' | 'absent' | 'late' | 'excused';
  }): Promise<AttendanceRecord[]> => {
    try {
      const { data } = await axios.get<ApiResponse<AttendanceRecord[]>>(`/api/parent/child/${childId}/attendance`, { 
        params: filters
      });
      return data.data;
    } catch (error) {
      console.error(`Error fetching attendance for child ${childId}:`, error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return filtered mock data for now
      const allRecords = await parentService.getChildrenAttendance();
      return allRecords.filter(record => record.studentId === childId);
    }
  },
  
  /**
   * Get attendance statistics for all children of the parent
   */
  getChildrenAttendanceStats: async (): Promise<{
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
  }[]> => {
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
      return data.data;
    } catch (error) {
      console.error('Error fetching children attendance statistics:', error);
      // Fallback to mock data if API fails
      await delay(1000);
      
      // Get all children
      const children = await parentService.getChildren();
      
      // Get all attendance records
      const attendanceRecords = await parentService.getChildrenAttendance();
      
      // Calculate statistics for each child
      return children.map(child => {
        const childRecords = attendanceRecords.filter(record => record.studentId === child.id);
        const totalClasses = childRecords.length;
        const presentCount = childRecords.filter(r => r.status === "present").length;
        const absentCount = childRecords.filter(r => r.status === "absent").length;
        const lateCount = childRecords.filter(r => r.status === "late").length;
        const excusedCount = childRecords.filter(r => r.status === "excused").length;
        
        return {
          childId: child.id,
          childName: child.name,
          stats: {
            totalClasses,
            presentCount,
            absentCount,
            lateCount,
            excusedCount,
            attendanceRate: totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0
          }
        };
      });
    }
  },

  /**
   * Get payment information for all children of the parent
   */
  getPayments: async (filters?: {
    startDate?: string;
    endDate?: string;
    status?: 'paid' | 'pending' | 'overdue';
    childId?: string;
  }): Promise<Payment[]> => {
    try {
      const { data } = await axios.get<ApiResponse<Payment[]>>('/api/parent/payments', { 
        params: filters
      });
      return data.data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return mock data for now
      return [
        {
          id: "p1",
          childId: "1",
          childName: "Emma Johnson",
          description: "School Fees - Term 1",
          amount: 500,
          dueDate: "2023-03-15",
          status: "paid",
          transactionId: "tx-12345",
          paymentDate: "2023-03-10",
          paymentMethod: "Credit Card",
          invoiceUrl: "/documents/invoices/inv-12345.pdf"
        },
        {
          id: "p2",
          childId: "1",
          childName: "Emma Johnson",
          description: "Field Trip - Science Museum",
          amount: 45,
          dueDate: "2023-04-05",
          status: "pending"
        },
        {
          id: "p3",
          childId: "2",
          childName: "Noah Johnson",
          description: "School Fees - Term 1",
          amount: 500,
          dueDate: "2023-03-15",
          status: "paid",
          transactionId: "tx-12346",
          paymentDate: "2023-03-14",
          paymentMethod: "Bank Transfer",
          invoiceUrl: "/documents/invoices/inv-12346.pdf"
        },
        {
          id: "p4",
          childId: "2",
          childName: "Noah Johnson",
          description: "Art Supplies",
          amount: 30,
          dueDate: "2023-02-28",
          status: "overdue"
        }
      ];
    }
  },

  /**
   * Pay for a specific payment
   */
  makePayment: async (paymentId: string, paymentDetails: {
    amount: number;
    paymentMethod: string;
  }): Promise<{
    success: boolean;
    transactionId?: string;
    paymentDate?: string;
    message: string;
  }> => {
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        transactionId?: string;
        paymentDate?: string;
        message: string;
      }>>(`/api/parent/payments/${paymentId}/pay`, paymentDetails);
      return data.data;
    } catch (error) {
      console.error(`Error making payment for ${paymentId}:`, error);
      // Simulate payment processing
      await delay(1500);
      
      // Simulate payment success
      return {
        success: true,
        transactionId: `tx-${Math.floor(Math.random() * 100000)}`,
        paymentDate: new Date().toISOString(),
        message: 'Payment processed successfully'
      };
    }
  },

  /**
   * Get documents for children of the parent
   */
  getDocuments: async (filters?: {
    childId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Document[]> => {
    try {
      const { data } = await axios.get<ApiResponse<Document[]>>('/api/parent/documents', { 
        params: filters
      });
      return data.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return mock data for now
      return [
        {
          id: "d1",
          childId: "1",
          childName: "Emma Johnson",
          title: "Term 1 Report Card",
          type: "report_card",
          uploadDate: "2023-03-20",
          size: 1240000, // in bytes
          fileUrl: "/documents/report_cards/emma_term1.pdf",
          isNew: true
        },
        {
          id: "d2",
          childId: "1",
          childName: "Emma Johnson",
          title: "Science Museum Field Trip Permission",
          type: "permission_slip",
          uploadDate: "2023-03-10",
          size: 540000,
          fileUrl: "/documents/permission_slips/science_museum.pdf",
          requiresSignature: true,
          signatureStatus: "pending"
        },
        {
          id: "d3",
          childId: "2",
          childName: "Noah Johnson",
          title: "Term 1 Report Card",
          type: "report_card",
          uploadDate: "2023-03-20",
          size: 1180000,
          fileUrl: "/documents/report_cards/noah_term1.pdf",
          isNew: true
        },
        {
          id: "d4",
          title: "School Newsletter - March 2023",
          type: "newsletter",
          uploadDate: "2023-03-01",
          size: 2540000,
          fileUrl: "/documents/newsletters/march_2023.pdf"
        }
      ];
    }
  },

  /**
   * Download a document
   */
  downloadDocument: async (documentId: string): Promise<Blob> => {
    try {
      const response = await axios.get<Blob>(`/api/parent/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading document ${documentId}:`, error);
      throw new Error('Failed to download document');
    }
  },

  /**
   * Sign a document
   */
  signDocument: async (documentId: string, signature: {
    signatureData: string;
    signatureDate: string;
  }): Promise<{
    success: boolean;
    signatureId?: string;
    message: string;
  }> => {
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        signatureId?: string;
        message: string;
      }>>(`/api/parent/documents/${documentId}/sign`, signature);
      return data.data;
    } catch (error) {
      console.error(`Error signing document ${documentId}:`, error);
      // Simulate signature processing
      await delay(1000);
      
      // Simulate signature success
      return {
        success: true,
        signatureId: `sig-${Math.floor(Math.random() * 100000)}`,
        message: 'Document signed successfully'
      };
    }
  },

  /**
   * Get feedback messages for children of the parent
   */
  getFeedback: async (filters?: {
    childId?: string;
    startDate?: string;
    endDate?: string;
    isRead?: boolean;
    category?: 'academic' | 'behavior' | 'attendance' | 'general';
  }): Promise<FeedbackItem[]> => {
    try {
      const { data } = await axios.get<ApiResponse<FeedbackItem[]>>('/api/parent/feedback', { 
        params: filters
      });
      return data.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return mock data for now
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
        },
        {
          id: "f4",
          childId: "2",
          childName: "Noah Johnson",
          teacherId: "t1",
          teacherName: "Mr. Anderson",
          subject: "Missing Math Homework",
          message: "Noah has not submitted his math homework for the past two assignments. Please help ensure he completes and submits them.",
          date: "2023-03-05",
          isRead: false,
          category: "academic",
          priority: "high",
          responseRequired: true
        }
      ];
    }
  },

  /**
   * Get responses for a specific feedback message
   */
  getFeedbackResponses: async (feedbackId: string): Promise<FeedbackResponse[]> => {
    try {
      const { data } = await axios.get<ApiResponse<FeedbackResponse[]>>(`/api/parent/feedback/${feedbackId}/responses`);
      return data.data;
    } catch (error) {
      console.error(`Error fetching responses for feedback ${feedbackId}:`, error);
      // Fallback to mock data if API fails
      await delay(800);
      
      // Return mock data for now
      return [
        {
          id: "r1",
          feedbackId: feedbackId,
          responderId: "p1",
          responderName: "Mrs. Johnson",
          responderRole: "parent",
          message: "Thank you for letting me know. I'll make sure she arrives on time from now on.",
          date: "2023-03-15T14:30:00Z",
          isRead: true
        },
        {
          id: "r2",
          feedbackId: feedbackId,
          responderId: "t2",
          responderName: "Ms. Thompson",
          responderRole: "teacher",
          message: "Thank you for your prompt response. I appreciate your cooperation.",
          date: "2023-03-15T15:45:00Z",
          isRead: false
        }
      ];
    }
  },

  /**
   * Send response to a feedback message
   */
  respondToFeedback: async (feedbackId: string, response: {
    message: string;
  }): Promise<{
    success: boolean;
    responseId?: string;
    message: string;
  }> => {
    try {
      const { data } = await axios.post<ApiResponse<{
        success: boolean;
        responseId?: string;
        message: string;
      }>>(`/api/parent/feedback/${feedbackId}/respond`, response);
      return data.data;
    } catch (error) {
      console.error(`Error responding to feedback ${feedbackId}:`, error);
      // Simulate response processing
      await delay(1000);
      
      // Simulate response success
      return {
        success: true,
        responseId: `r-${Math.floor(Math.random() * 100000)}`,
        message: 'Response sent successfully'
      };
    }
  },

  /**
   * Mark feedback as read
   */
  markFeedbackAsRead: async (feedbackId: string): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const { data } = await axios.put<ApiResponse<{
        success: boolean;
        message: string;
      }>>(`/api/parent/feedback/${feedbackId}/read`);
      return data.data;
    } catch (error) {
      console.error(`Error marking feedback ${feedbackId} as read:`, error);
      // Simulate processing
      await delay(500);
      
      // Simulate success
      return {
        success: true,
        message: 'Feedback marked as read'
      };
    }
  }
}; 