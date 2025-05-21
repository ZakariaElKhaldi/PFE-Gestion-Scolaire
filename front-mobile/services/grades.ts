import { apiClient } from "../utils/api-client";

export interface Grade {
  id: string;
  assignmentId: string;
  score: number;
  totalPoints: number;
  comments?: string;
  gradedAt: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  courseCode: string;
}

export interface CourseGrade {
  id: string;
  name: string;
  code: string;
  teacher: string; // Teacher name
  currentGrade: number; // Calculated average grade
  grades: Grade[];
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
}

// Mock data for development
const MOCK_GRADES: Grade[] = [
  {
    id: 'g1',
    assignmentId: 'a1',
    score: 85,
    totalPoints: 100,
    comments: 'Good work on algebraic expressions',
    gradedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    assignmentTitle: 'Algebra Quiz',
    courseId: 'c1',
    courseName: 'Mathematics',
    courseCode: 'MATH101'
  },
  {
    id: 'g2',
    assignmentId: 'a2',
    score: 92,
    totalPoints: 100,
    comments: 'Excellent understanding of calculus concepts',
    gradedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    assignmentTitle: 'Calculus Midterm',
    courseId: 'c1',
    courseName: 'Mathematics',
    courseCode: 'MATH101'
  },
  {
    id: 'g3',
    assignmentId: 'a3',
    score: 78,
    totalPoints: 100,
    comments: 'Need more practice with force calculations',
    gradedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    assignmentTitle: 'Mechanics Quiz',
    courseId: 'c2',
    courseName: 'Physics',
    courseCode: 'PHYS101'
  },
  {
    id: 'g4',
    assignmentId: 'a4',
    score: 95,
    totalPoints: 100,
    comments: 'Excellent experimental analysis',
    gradedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignmentTitle: 'Lab Report',
    courseId: 'c2',
    courseName: 'Physics',
    courseCode: 'PHYS101'
  },
  {
    id: 'g5',
    assignmentId: 'a5',
    score: 85,
    totalPoints: 100,
    comments: 'Good analysis but needs more textual evidence',
    gradedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    assignmentTitle: 'Essay',
    courseId: 'c3',
    courseName: 'Literature',
    courseCode: 'LIT101'
  }
];

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class GradesService {
  // Get all grades for the current student
  async getAllGrades(): Promise<Grade[]> {
    try {
      // For development, use mock data
      if (__DEV__) {
        await delay(800); // Simulate network delay
        return MOCK_GRADES;
      }
      
      // Real API call for production
      const response = await apiClient.get<Grade[]>('/students/grades');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all grades:', error);
      return [];
    }
  }
  
  // Get recent grades for the current student (limited number)
  async getRecentGrades(limit: number = 5): Promise<Grade[]> {
    try {
      // For development, use mock data
      if (__DEV__) {
        await delay(800); // Simulate network delay
        return MOCK_GRADES
          .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
          .slice(0, limit);
      }
      
      // Real API call for production
      const response = await apiClient.get<Grade[]>(`/students/grades/recent?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent grades:', error);
      return [];
    }
  }
  
  // Get grades organized by course
  async getGradesByCourse(): Promise<CourseGrade[]> {
    try {
      // First, get all grades
      const allGrades = await this.getAllGrades();
      
      if (allGrades.length === 0) {
        return [];
      }
      
      // Group grades by course
      const courseMap = new Map<string, Grade[]>();
      
      // Group all grades by courseId
      allGrades.forEach(grade => {
        if (!courseMap.has(grade.courseId)) {
          courseMap.set(grade.courseId, []);
        }
        courseMap.get(grade.courseId)?.push(grade);
      });
      
      // Convert the map to our CourseGrade[] format
      const courseGrades: CourseGrade[] = [];
      
      for (const [courseId, grades] of courseMap.entries()) {
        // Get course info from the first grade
        const { courseName, courseCode } = grades[0];
        
        // Calculate current grade (average of all grades)
        let totalScore = 0;
        let totalPoints = 0;
        
        grades.forEach(grade => {
          totalScore += grade.score;
          totalPoints += grade.totalPoints;
        });
        
        const currentGrade = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        
        // Sort grades by date (newest first)
        const sortedGrades = [...grades].sort(
          (a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime()
        );
        
        // Calculate trend (if we have at least 2 grades)
        let trend;
        if (sortedGrades.length > 1) {
          // Compare most recent grade with second most recent
          const latestGrade = sortedGrades[0];
          const previousGrade = sortedGrades[1];
          
          const latestPercentage = (latestGrade.score / latestGrade.totalPoints) * 100;
          const previousPercentage = (previousGrade.score / previousGrade.totalPoints) * 100;
          
          const difference = latestPercentage - previousPercentage;
          
          if (Math.abs(difference) < 0.5) {
            trend = { direction: 'stable' as const, value: 0 };
          } else if (difference > 0) {
            trend = { direction: 'up' as const, value: Math.round(difference * 10) / 10 };
          } else {
            trend = { direction: 'down' as const, value: Math.round(Math.abs(difference) * 10) / 10 };
          }
        }
        
        courseGrades.push({
          id: courseId,
          name: courseName,
          code: courseCode,
          teacher: 'Teacher', // We don't have teacher name in our data model yet
          currentGrade,
          grades: sortedGrades,
          trend
        });
      }
      
      return courseGrades;
    } catch (error) {
      console.error('Error organizing grades by course:', error);
      return [];
    }
  }
}

export const gradesService = new GradesService(); 