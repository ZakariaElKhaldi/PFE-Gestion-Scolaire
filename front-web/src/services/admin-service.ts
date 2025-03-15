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

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock admin dashboard data
const MOCK_DASHBOARD_DATA: AdminDashboardData = {
  stats: {
    totalStudents: 2456,
    totalTeachers: 128,
    totalClasses: 64,
    totalParents: 3842,
    studentChange: 12,
    teacherChange: 5,
    parentChange: 8
  },
  recentActivities: [
    {
      id: '1',
      type: 'registration',
      title: 'New Student Registration',
      description: 'John Doe has been registered as a new student',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'payment',
      title: 'Tuition Payment Received',
      description: 'Payment of $1,500 received from Sarah Smith',
      timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'attendance',
      title: 'Attendance Report',
      description: 'Class 10A attendance marked for today',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'grade',
      title: 'Grades Updated',
      description: 'Mathematics exam grades updated for Class 9B',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'system',
      title: 'System Maintenance',
      description: 'Scheduled system maintenance completed',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      type: 'registration',
      title: 'New Teacher Onboarded',
      description: 'Dr. Melissa Johnson joined as Physics teacher',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '7',
      type: 'payment',
      title: 'Field Trip Payments',
      description: '85% of students have paid for the science museum trip',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '8',
      type: 'system',
      title: 'New Module Activated',
      description: 'Online assessment module has been activated',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ]
};

/**
 * Admin Service for managing admin-related operations
 */
export const adminService = {
  /**
   * Get dashboard data with stats and activities
   */
  getDashboardData: async (): Promise<AdminDashboardData> => {
    // Simulate API call delay
    await delay(1000);
    return { ...MOCK_DASHBOARD_DATA };
  },
  
  /**
   * Get detailed user statistics (more comprehensive than dashboard stats)
   */
  getUserStats: async () => {
    // Simulate API call delay
    await delay(1200);
    
    return {
      students: {
        total: MOCK_DASHBOARD_DATA.stats.totalStudents,
        active: MOCK_DASHBOARD_DATA.stats.totalStudents - 45,
        newThisMonth: 78,
        byGrade: {
          'Grade 6': 412,
          'Grade 7': 389,
          'Grade 8': 402,
          'Grade 9': 421,
          'Grade 10': 398,
          'Grade 11': 232,
          'Grade 12': 202
        }
      },
      teachers: {
        total: MOCK_DASHBOARD_DATA.stats.totalTeachers,
        fullTime: 98,
        partTime: 30,
        byDepartment: {
          'Mathematics': 24,
          'Science': 22,
          'English': 19,
          'History': 16,
          'Arts': 12,
          'Physical Education': 8,
          'Foreign Languages': 15,
          'Computer Science': 12
        }
      },
      parents: {
        total: MOCK_DASHBOARD_DATA.stats.totalParents,
        active: 3245,
        withMultipleChildren: 1324
      }
    };
  },

  /**
   * Get system health statistics
   */
  getSystemStats: async () => {
    // Simulate API call delay
    await delay(800);
    
    return {
      uptime: '99.98%',
      storage: {
        total: '2TB',
        used: '1.2TB',
        available: '0.8TB'
      },
      performance: {
        responseTime: '245ms',
        activeUsers: 324,
        peakHours: ['09:00-10:00', '13:00-14:00']
      },
      lastBackup: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      systemVersion: 'v2.5.1'
    };
  }
}; 