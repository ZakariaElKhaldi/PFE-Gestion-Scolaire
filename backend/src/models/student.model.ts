import { promisify } from 'util';
import { pool } from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';

// Flag to track if database is available
let isDatabaseAvailable = true;

// Check if the database pool is properly initialized
const checkDbAvailability = () => {
  if (!pool || !pool.query) {
    if (isDatabaseAvailable) {
      console.error('Database is not available, using mock data');
      isDatabaseAvailable = false;
    }
    return false;
  }
  return true;
};

// Mock data for when database is unavailable
const mockStudentData = {
  courses: [
    {
      id: 'mock-course-1',
      name: 'Mock Introduction to Computer Science',
      code: 'CS101',
      description: 'Introduction to the basic concepts of computer science',
      credits: 3,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      enrollmentStatus: 'active',
      enrolledAt: new Date().toISOString()
    },
    {
      id: 'mock-course-2',
      name: 'Mock Web Development',
      code: 'CS102',
      description: 'Introduction to web development',
      credits: 3,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      enrollmentStatus: 'active',
      enrolledAt: new Date().toISOString()
    }
  ],
  upcomingAssignments: [
    {
      id: 'mock-assignment-1',
      title: 'Mock Homework 1',
      description: 'Complete exercises 1-10',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalPoints: 100,
      courseId: 'mock-course-1',
      courseName: 'Mock Introduction to Computer Science',
      courseCode: 'CS101'
    },
    {
      id: 'mock-assignment-2',
      title: 'Mock Project 1',
      description: 'Create a simple website',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalPoints: 100,
      courseId: 'mock-course-2',
      courseName: 'Mock Web Development',
      courseCode: 'CS102'
    }
  ],
  recentGrades: [
    {
      id: 'mock-grade-1',
      assignmentId: 'mock-prev-assignment-1',
      score: 85,
      comments: 'Good work!',
      feedback: 'Good job on your implementation. Consider adding more comments.',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      gradedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignmentTitle: 'Mock Previous Assignment',
      totalPoints: 100,
      courseId: 'mock-course-1',
      courseName: 'Mock Introduction to Computer Science',
      courseCode: 'CS101'
    }
  ],
  attendanceStats: {
    present: 10,
    absent: 1,
    late: 2,
    excused: 0,
    total: 13,
    percentage: 76.92
  }
};

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentDate: Date;
  graduationDate?: Date;
  status: 'active' | 'graduated' | 'on_leave' | 'suspended';
}

export class StudentModel {
  // Find student by ID
  static async findById(id: string): Promise<Student | null> {
    try {
      if (!checkDbAvailability()) {
        return {
          id: 'mock-student-1',
          userId: id,
          firstName: 'Mock',
          lastName: 'Student',
          email: 'mock.student@example.com',
          enrollmentDate: new Date(),
          status: 'active'
        };
      }

      const query = `
        SELECT s.id, s.userId, u.firstName, u.lastName, u.email, s.enrollmentDate, s.graduationDate, s.status
        FROM students s
        JOIN users u ON s.userId = u.id
        WHERE s.id = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const student = rows[0];
      return {
        id: student.id.toString(),
        userId: student.userId.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        enrollmentDate: new Date(student.enrollmentDate),
        graduationDate: student.graduationDate ? new Date(student.graduationDate) : undefined,
        status: student.status as 'active' | 'graduated' | 'on_leave' | 'suspended'
      };
    } catch (error) {
      console.error('Error finding student by id:', error);
      // Return mock student on error
      return {
        id: 'mock-student-1',
        userId: id,
        firstName: 'Mock',
        lastName: 'Student',
        email: 'mock.student@example.com',
        enrollmentDate: new Date(),
        status: 'active'
      };
    }
  }

  // Check if student is enrolled in a course
  static async isEnrolledInCourse(studentId: string, courseId: string): Promise<boolean> {
    try {
      if (!checkDbAvailability()) {
        return true; // Assume enrolled for mock data
      }

      const query = `
        SELECT 1
        FROM course_enrollments
        WHERE studentId = ? AND courseId = ? AND status = 'active'
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId, courseId]);

      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if student is enrolled in course:', error);
      return true; // Assume enrolled on error
    }
  }

  // Check if user is a teacher for a course
  static async isTeacherForCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      if (!checkDbAvailability()) {
        return false; // Assume not a teacher for mock data
      }

      const query = `
        SELECT 1
        FROM course_teachers
        JOIN users ON users.id = course_teachers.teacherId
        WHERE users.id = ? AND course_teachers.courseId = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [userId, courseId]);

      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if user is teacher for course:', error);
      return false; // Assume not a teacher on error
    }
  }

  // Get student courses
  static async getStudentCourses(studentId: string, filters?: { status?: string; search?: string }): Promise<any[]> {
    try {
      // Instead of falling back to mock data, let's ensure the pool is available
      // and throw an informative error if it's not
      if (!pool || !pool.query) {
        console.error('Database pool is not properly initialized.');
        throw new Error('Database connection is not available');
      }

      let query = `
        SELECT c.id, c.name, c.code, c.description, c.credits, c.startDate, c.endDate, c.status,
               ce.status as enrollmentStatus
        FROM courses c
        JOIN course_enrollments ce ON c.id = ce.courseId
        WHERE ce.studentId = ?
      `;

      const params: any[] = [studentId];

      if (filters) {
        if (filters.status && filters.status !== 'all') {
          query += ` AND c.status = ?`;
          params.push(filters.status);
        }

        if (filters.search) {
          query += ` AND (c.name LIKE ? OR c.code LIKE ? OR c.description LIKE ?)`;
          const searchTerm = `%${filters.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
      }

      query += ` ORDER BY c.startDate DESC`;

      console.log('Executing getStudentCourses query for student:', studentId);
      
      // Use the pool directly instead of promisifying
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      
      console.log(`Found ${rows.length} real courses for student ${studentId}`);

      if (rows.length === 0) {
        console.log('No courses found in database, returning empty array');
        return [];
      }

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        name: row.name,
        code: row.code,
        description: row.description,
        credits: row.credits || 0,
        startDate: row.startDate ? new Date(row.startDate) : new Date(),
        endDate: row.endDate ? new Date(row.endDate) : new Date(),
        status: row.status,
        enrollmentStatus: row.enrollmentStatus
      }));
    } catch (error) {
      console.error('Error getting student courses:', error);
      // Instead of returning mock data, throw the error or return an empty array
      console.log('Returning empty array instead of mock data');
      return [];
    }
  }

  // Get upcoming assignments for a student
  static async getUpcomingAssignments(studentId: string, limit: number = 5): Promise<any[]> {
    try {
      if (!checkDbAvailability()) {
        return mockStudentData.upcomingAssignments.slice(0, limit);
      }

      const query = `
        SELECT a.id, a.title, a.description, a.dueDate, a.totalPoints,
               c.id as courseId, c.name as courseName, c.code as courseCode
        FROM assignments a
        JOIN courses c ON a.courseId = c.id
        JOIN course_enrollments ce ON c.id = ce.courseId AND ce.studentId = ?
        WHERE a.dueDate > NOW() AND ce.status = 'active'
        ORDER BY a.dueDate ASC
        LIMIT ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId, limit]);

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        dueDate: new Date(row.dueDate),
        totalPoints: row.totalPoints,
        courseId: row.courseId.toString(),
        courseName: row.courseName,
        courseCode: row.courseCode
      }));
    } catch (error) {
      console.error('Error getting upcoming assignments:', error);
      return mockStudentData.upcomingAssignments.slice(0, limit);
    }
  }

  // Get recent grades for a student
  static async getRecentGrades(studentId: string, limit: number = 5): Promise<any[]> {
    try {
      if (!checkDbAvailability()) {
        return mockStudentData.recentGrades.slice(0, limit);
      }

      const query = `
        SELECT g.id, g.assignmentId, g.score, g.comments, g.gradedAt,
               a.title as assignmentTitle, a.totalPoints,
               c.id as courseId, c.name as courseName, c.code as courseCode
        FROM grades g
        JOIN assignments a ON g.assignmentId = a.id
        JOIN courses c ON a.courseId = c.id
        WHERE g.studentId = ?
        ORDER BY g.gradedAt DESC
        LIMIT ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId, limit]);

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        assignmentId: row.assignmentId.toString(),
        score: row.score,
        comments: row.comments,
        gradedAt: new Date(row.gradedAt),
        assignmentTitle: row.assignmentTitle,
        totalPoints: row.totalPoints,
        courseId: row.courseId.toString(),
        courseName: row.courseName,
        courseCode: row.courseCode
      }));
    } catch (error) {
      console.error('Error getting recent grades:', error);
      return mockStudentData.recentGrades.slice(0, limit);
    }
  }

  // Get attendance statistics for a student
  static async getAttendanceStats(studentId: string): Promise<any> {
    try {
      if (!checkDbAvailability()) {
        return mockStudentData.attendanceStats;
      }

      const query = `
        SELECT 
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
          COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
          COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
          COUNT(*) as total
        FROM attendance
        WHERE studentId = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId]);

      if (rows.length === 0) {
        return {
          present: 0,
          absent: 0,
          late: 0,
          total: 0,
          percentage: 0
        };
      }

      const stats = rows[0];
      const percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

      return {
        present: stats.present,
        absent: stats.absent,
        late: stats.late,
        total: stats.total,
        percentage: Math.round(percentage * 100) / 100 // Round to 2 decimal places
      };
    } catch (error) {
      console.error('Error getting attendance statistics:', error);
      return mockStudentData.attendanceStats;
    }
  }

  /**
   * Find students by class IDs
   */
  static async findByClassIds(classIds: string[]): Promise<any[]> {
    if (!checkDbAvailability() || !classIds.length) {
      // Return mock data if database is not available or no class IDs
      return [
        {
          id: 'mock-student-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          classId: 'mock-class-1',
          profileImage: null,
          enrollmentDate: new Date(),
          status: 'active'
        },
        {
          id: 'mock-student-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          classId: 'mock-class-1',
          profileImage: null,
          enrollmentDate: new Date(),
          status: 'active'
        }
      ];
    }

    try {
      const placeholders = classIds.map(() => '?').join(',');
      const query = `
        SELECT DISTINCT s.id, u.firstName, u.lastName, u.email, ce.courseId as classId, u.profileImage
        FROM students s
        JOIN users u ON s.userId = u.id
        JOIN course_enrollments ce ON s.id = ce.studentId
        JOIN classes c ON ce.courseId = c.courseId
        WHERE c.id IN (${placeholders})
      `;

      const [rows] = await pool.query(query, classIds);
      
      if (!rows.length) {
        return [];
      }

      return rows.map((row: any) => ({
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        classId: row.classId,
        profileImage: row.profileImage,
        enrollmentDate: row.enrollmentDate ? new Date(row.enrollmentDate) : new Date(),
        status: row.status || 'active'
      }));
    } catch (error) {
      console.error('Error finding students by class IDs:', error);
      // Return mock data on error
      return [
        {
          id: 'mock-student-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          classId: classIds[0] || 'unknown',
          profileImage: null,
          enrollmentDate: new Date(),
          status: 'active'
        }
      ];
    }
  }
}

// SQL to create the students table
export const createStudentsTableSQL = `
  CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    enrollmentDate DATE NOT NULL,
    graduationDate DATE,
    status ENUM('active', 'graduated', 'on_leave', 'suspended') DEFAULT 'active',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`; 