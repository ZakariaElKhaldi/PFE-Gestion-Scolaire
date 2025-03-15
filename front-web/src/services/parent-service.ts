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

/**
 * Parent Service for managing parent-related operations
 */
export const parentService = {
  /**
   * Get all children of the parent
   */
  getChildren: async (): Promise<Child[]> => {
    // Simulate API call delay
    await delay(800);
    return [...MOCK_CHILDREN];
  },
  
  /**
   * Get monitoring data for a specific child
   */
  getChildMonitoringData: async (childId: string): Promise<ChildMonitoringData> => {
    // Simulate API call delay
    await delay(1200);
    
    const data = MOCK_MONITORING_DATA[childId];
    
    if (!data) {
      throw new Error('Child not found');
    }
    
    return data;
  }
}; 