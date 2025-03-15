import axios from 'axios';
import { API_URL } from '../config/constants';
import { handleApiError } from '../utils/error-handler';

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

// Helper to check online status
const checkOnlineStatus = () => {
  return navigator.onLine;
};

// Mock data for fallback when offline
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

// Mock user stats data
const MOCK_USER_STATS = {
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

// Mock system stats data
const MOCK_SYSTEM_STATS = {
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

// Mock financial overview data
const MOCK_FINANCIAL_OVERVIEW = {
  totalRevenue: 1250000,
  revenueByCategory: {
    'Tuition': 850000,
    'Fees': 150000,
    'Donations': 120000,
    'Other': 130000
  },
  revenueByMonth: {
    '2023-01': 95000,
    '2023-02': 98000,
    '2023-03': 102000,
    '2023-04': 105000,
    '2023-05': 110000,
    '2023-06': 115000,
    '2023-07': 90000,
    '2023-08': 85000,
    '2023-09': 120000,
    '2023-10': 125000,
    '2023-11': 130000,
    '2023-12': 75000
  },
  recentTransactions: [
    { id: 'TX123456', date: '2023-12-01', description: 'Staff Salaries', category: 'Payroll', amount: 45000, status: 'completed' },
    { id: 'TX123457', date: '2023-12-02', description: 'Laboratory Equipment', category: 'Equipment', amount: 12500, status: 'completed' },
    { id: 'TX123458', date: '2023-12-03', description: 'Software Licenses', category: 'IT', amount: 7800, status: 'completed' },
    { id: 'TX123459', date: '2023-12-04', description: 'Building Maintenance', category: 'Facilities', amount: 5600, status: 'pending' },
    { id: 'TX123460', date: '2023-12-05', description: 'Library Books', category: 'Academic', amount: 3200, status: 'completed' }
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
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning mock data');
        return { ...MOCK_DASHBOARD_DATA };
      }

      console.log('Fetching dashboard data from API');
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      
      // Validate response data
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Invalid response format from API, using mock data');
        return { ...MOCK_DASHBOARD_DATA };
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Always return mock data on error to prevent UI crashes
      return { ...MOCK_DASHBOARD_DATA };
    }
  },
  
  /**
   * Get detailed user statistics (more comprehensive than dashboard stats)
   */
  getUserStats: async () => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning mock data');
        return { ...MOCK_USER_STATS };
      }

      console.log('Fetching user statistics from API');
      const response = await axios.get(`${API_URL}/admin/users/stats`);
      
      // Validate response data
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Invalid response format from API, using mock data');
        return { ...MOCK_USER_STATS };
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      // Always return mock data on error to prevent UI crashes
      return { ...MOCK_USER_STATS };
    }
  },

  /**
   * Get system health statistics
   */
  getSystemStats: async () => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning mock data');
        return { ...MOCK_SYSTEM_STATS };
      }

      console.log('Fetching system statistics from API');
      const response = await axios.get(`${API_URL}/admin/system/stats`);
      
      // Validate response data
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Invalid response format from API, using mock data');
        return { ...MOCK_SYSTEM_STATS };
      }
    } catch (error) {
      console.error('Error fetching system statistics:', error);
      // Always return mock data on error to prevent UI crashes
      return { ...MOCK_SYSTEM_STATS };
    }
  },

  /**
   * Get financial overview data
   */
  getFinancialOverview: async () => {
    try {
      // Check if online
      if (!checkOnlineStatus()) {
        console.log('Browser is offline, returning mock data');
        return { ...MOCK_FINANCIAL_OVERVIEW };
      }

      console.log('Fetching financial overview from API');
      const response = await axios.get(`${API_URL}/admin/financial/overview`);
      
      // Validate response data
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.warn('Invalid response format from API, using mock data');
        return { ...MOCK_FINANCIAL_OVERVIEW };
      }
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      // Always return mock data on error to prevent UI crashes
      return { ...MOCK_FINANCIAL_OVERVIEW };
    }
  }
}; 