import { apiClient } from '../lib/api-client';

export interface TeacherClass {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  studentCount: number;
  room: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  upcomingAssignments: number;
  pendingGrades: number;
  averageAttendance: number;
  recentSubmissions: number;
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

// Mock data for teacher statistics
const MOCK_STATS: TeacherStats = {
  totalClasses: 5,
  totalStudents: 149,
  upcomingAssignments: 12,
  pendingGrades: 28,
  averageAttendance: 92,
  recentSubmissions: 47
};

// Mock data for class students
const MOCK_CLASS_STUDENTS: Record<string, any[]> = {
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
const MOCK_CLASS_ASSIGNMENTS: Record<string, any[]> = {
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
const MOCK_ATTENDANCE: Record<string, any[]> = {
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

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class TeacherService {
  /**
   * Get all classes for the teacher
   */
  async getClasses(): Promise<TeacherClass[]> {
    // Simulate API delay
    await delay(800);
    return [...MOCK_CLASSES];
  }

  /**
   * Get teacher dashboard statistics
   */
  async getStats(): Promise<TeacherStats> {
    // Simulate API delay
    await delay(600);
    return { ...MOCK_STATS };
  }

  /**
   * Get students in a specific class
   */
  async getClassStudents(classId: string): Promise<any[]> {
    // Simulate API delay
    await delay(700);
    return MOCK_CLASS_STUDENTS[classId] || [];
  }

  /**
   * Get teacher's schedule for a specific day
   */
  async getScheduleByDay(day: string): Promise<any[]> {
    // Simulate API delay
    await delay(500);
    
    // Filter classes by the given day
    const scheduleItems = MOCK_CLASSES
      .filter(cls => cls.schedule.some(s => s.day.toLowerCase() === day.toLowerCase()))
      .map(cls => {
        const scheduleForDay = cls.schedule.find(s => s.day.toLowerCase() === day.toLowerCase());
        return {
          classId: cls.id,
          className: cls.name,
          courseName: cls.courseName,
          room: cls.room,
          startTime: scheduleForDay?.startTime,
          endTime: scheduleForDay?.endTime,
          studentCount: cls.studentCount
        };
      });
    
    return scheduleItems;
  }

  /**
   * Update class details
   */
  async updateClass(classId: string, updates: Partial<TeacherClass>): Promise<TeacherClass> {
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
  }

  /**
   * Get assignments for a specific class
   */
  async getClassAssignments(classId: string): Promise<any[]> {
    // Simulate API delay
    await delay(800);
    return MOCK_CLASS_ASSIGNMENTS[classId] || [];
  }

  /**
   * Submit attendance for a class
   */
  async submitAttendance(classId: string, date: string, attendance: Record<string, 'present' | 'absent' | 'late'>): Promise<void> {
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
    
    // Success - no return needed
  }

  /**
   * Get attendance records for a class
   */
  async getClassAttendance(classId: string, startDate?: string, endDate?: string): Promise<any[]> {
    // Simulate API delay
    await delay(700);
    
    // Return all attendance records for this class
    // In a real implementation, we would filter by date range
    return MOCK_ATTENDANCE[classId] || [];
  }

  /**
   * Get all courses for the teacher from the API
   */
  async getCourses() {
    try {
      console.log('Fetching teacher courses from API');
      const response = await apiClient.get<any>('/teachers/courses');
      
      // Log the entire response structure for debugging
      console.log('Full API response:', JSON.stringify(response));
      
      // Check each level of the response structure
      if (response) {
        console.log('Response level 1:', typeof response);
        
        if (response.data) {
          console.log('Response level 2 (data):', typeof response.data, response.data);
          
          // The backend sends: { data: { courses: [...] }, message: '...' }
          // Check if courses exist at this level
          if (response.data.courses && Array.isArray(response.data.courses)) {
            console.log('Found courses in response.data.courses');
            return response.data.courses;
          }
          
          // If not found there, check if it's a direct array
          if (Array.isArray(response.data)) {
            console.log('Found courses as response.data array');
            return response.data;
          }
        }
      }
      
      // Fallback - return mock courses
      console.warn('No courses found in API response, using mock data');
      return [
        { id: 'mock-course-1', name: 'Mathematics' },
        { id: 'mock-course-2', name: 'Physics' },
        { id: 'mock-course-3', name: 'Chemistry' }
      ];
    } catch (error) {
      console.error('Error fetching teacher courses:', error);
      // Return mock courses as fallback
      return [
        { id: 'mock-course-1', name: 'Mathematics' },
        { id: 'mock-course-2', name: 'Physics' },
        { id: 'mock-course-3', name: 'Chemistry' }
      ];
    }
  }
}

export const teacherService = new TeacherService();
export default teacherService; 