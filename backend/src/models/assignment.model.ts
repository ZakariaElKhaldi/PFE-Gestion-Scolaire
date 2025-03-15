import { promisify } from 'util';
import { pool } from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// Helper function to check if database is available
const checkDbAvailability = () => {
  try {
    return !!pool && typeof pool.query === 'function';
  } catch (error) {
    return false;
  }
};

// Assignment types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'closed';
}

export interface CreateAssignmentDTO {
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  status?: 'draft' | 'published' | 'closed';
}

export interface UpdateAssignmentDTO {
  title?: string;
  description?: string;
  dueDate?: Date;
  totalPoints?: number;
  status?: 'draft' | 'published' | 'closed';
}

// Define the RowDataPacket extension for type safety
interface AssignmentRow extends Assignment, RowDataPacket {}

export class AssignmentModel {
  /**
   * Create assignment table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        dueDate DATETIME NOT NULL,
        totalPoints DECIMAL(5,2) NOT NULL DEFAULT 100.00,
        status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      );
    `;
    await pool.query(query);
  }

  /**
   * Get all assignments with optional filters
   */
  async findAll(filters?: {
    courseId?: string;
    status?: 'draft' | 'published' | 'closed';
    title?: string;
    dueDate?: string;
    dueBefore?: string;
    dueAfter?: string;
  }): Promise<Assignment[]> {
    let query = 'SELECT * FROM assignments';
    const params: any[] = [];
    
    // Build WHERE clause if filters are provided
    if (filters) {
      const conditions: string[] = [];
      
      if (filters.courseId) {
        conditions.push('courseId = ?');
        params.push(filters.courseId);
      }
      
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      
      if (filters.title) {
        conditions.push('title LIKE ?');
        params.push(`%${filters.title}%`);
      }
      
      if (filters.dueDate) {
        conditions.push('DATE(dueDate) = ?');
        params.push(filters.dueDate);
      }
      
      if (filters.dueBefore) {
        conditions.push('dueDate <= ?');
        params.push(filters.dueBefore);
      }
      
      if (filters.dueAfter) {
        conditions.push('dueDate >= ?');
        params.push(filters.dueAfter);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    query += ' ORDER BY dueDate ASC';
    
    const [rows] = await pool.query<AssignmentRow[]>(query, params);
    return rows;
  }

  /**
   * Get assignment by ID
   */
  async findById(id: string): Promise<Assignment | null> {
    const [rows] = await pool.query<AssignmentRow[]>(
      'SELECT * FROM assignments WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new assignment
   */
  async create(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'> & { status?: 'draft' | 'published' | 'closed' }): Promise<string> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO assignments (
        id, courseId, title, description, dueDate, totalPoints, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<OkPacket>(query, [
      id,
      assignmentData.courseId,
      assignmentData.title,
      assignmentData.description,
      assignmentData.dueDate,
      assignmentData.totalPoints,
      assignmentData.status || 'draft'
    ]);
    
    return id;
  }

  /**
   * Update an assignment
   */
  async update(id: string, assignmentData: Partial<Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'status'>>): Promise<boolean> {
    // Build query dynamically based on provided fields
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(assignmentData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const [result] = await pool.query<OkPacket>(query, values);
    return result.affectedRows > 0;
  }

  /**
   * Delete an assignment
   */
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM assignments WHERE id = ?';
    const [result] = await pool.query<OkPacket>(query, [id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Get assignments by course ID
   */
  async getByCourse(courseId: string): Promise<Assignment[]> {
    const [rows] = await pool.query<AssignmentRow[]>(
      'SELECT * FROM assignments WHERE courseId = ? ORDER BY dueDate ASC',
      [courseId]
    );
    return rows;
  }

  /**
   * Get upcoming assignments for a student based on their enrolled courses
   */
  async getUpcomingForStudent(studentId: string, limit: number = 5): Promise<Assignment[]> {
    const query = `
      SELECT a.* FROM assignments a
      JOIN course_enrollments ce ON a.courseId = ce.courseId
      WHERE ce.studentId = ? 
      AND ce.status = 'active'
      AND a.status = 'published'
      AND a.dueDate > NOW()
      ORDER BY a.dueDate ASC
      LIMIT ?
    `;
    
    const [rows] = await pool.query<AssignmentRow[]>(query, [studentId, limit]);
    return rows;
  }

  /**
   * Get recent assignments for a teacher based on courses they teach
   */
  async getRecentForTeacher(teacherId: string, limit: number = 10): Promise<Assignment[]> {
    const query = `
      SELECT a.* FROM assignments a
      JOIN courses c ON a.courseId = c.id
      WHERE c.teacherId = ?
      ORDER BY a.createdAt DESC
      LIMIT ?
    `;
    
    const [rows] = await pool.query<AssignmentRow[]>(query, [teacherId, limit]);
    return rows;
  }

  /**
   * Count assignments for a course
   */
  async countByCourse(courseId: string): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM assignments WHERE courseId = ?',
      [courseId]
    );
    
    return rows[0].count;
  }

  // Create a new assignment
  static async createAssignment(assignment: CreateAssignmentDTO): Promise<Assignment> {
    try {
      const query = `
        INSERT INTO assignments 
        (courseId, title, description, dueDate, totalPoints, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const status = assignment.status || 'draft';
      const values = [
        assignment.courseId,
        assignment.title,
        assignment.description,
        assignment.dueDate,
        assignment.totalPoints,
        status
      ];

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, values);

      return {
        id: result.insertId.toString(),
        courseId: assignment.courseId,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        totalPoints: assignment.totalPoints,
        status: status
      };
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  }

  // Get assignment by ID
  static async findAssignmentById(id: string): Promise<Assignment | null> {
    try {
      const query = `
        SELECT id, courseId, title, description, dueDate, totalPoints, createdAt, updatedAt, status
        FROM assignments
        WHERE id = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const assignment = rows[0];
      return {
        id: assignment.id.toString(),
        courseId: assignment.courseId.toString(),
        title: assignment.title,
        description: assignment.description,
        dueDate: new Date(assignment.dueDate),
        createdAt: new Date(assignment.createdAt),
        updatedAt: new Date(assignment.updatedAt),
        totalPoints: assignment.totalPoints,
        status: assignment.status
      };
    } catch (error) {
      console.error('Error finding assignment by id:', error);
      throw error;
    }
  }

  // Get assignments by course ID
  static async findAssignmentsByCourseId(courseId: string): Promise<Assignment[]> {
    try {
      const query = `
        SELECT id, courseId, title, description, dueDate, totalPoints, createdAt, updatedAt, status
        FROM assignments
        WHERE courseId = ?
        ORDER BY dueDate ASC
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [courseId]);

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        courseId: row.courseId.toString(),
        title: row.title,
        description: row.description,
        dueDate: new Date(row.dueDate),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        totalPoints: row.totalPoints,
        status: row.status
      }));
    } catch (error) {
      console.error('Error finding assignments by course id:', error);
      throw error;
    }
  }

  // Update an assignment
  static async updateAssignment(id: string, updates: UpdateAssignmentDTO): Promise<boolean> {
    try {
      const setFields = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');

      const query = `
        UPDATE assignments
        SET ${setFields}, updatedAt = NOW()
        WHERE id = ?
      `;

      const values = [...Object.values(updates), id];

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  }

  // Delete an assignment
  static async deleteAssignment(id: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM assignments WHERE id = ?
      `;

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  }

  /**
   * Find assignments by teacher ID
   */
  async findByTeacherId(teacherId: string): Promise<any[]> {
    if (!checkDbAvailability()) {
      // Return mock data if database is not available
      return [
        {
          id: 'mock-assignment-1',
          title: 'Homework 1',
          description: 'Complete exercises 1-10',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          points: 100,
          status: 'pending',
          createdAt: new Date(),
          courseId: 'mock-course-1'
        },
        {
          id: 'mock-assignment-2',
          title: 'Final Project',
          description: 'Submit your project with documentation',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          points: 200,
          status: 'pending',
          createdAt: new Date(),
          courseId: 'mock-course-2'
        }
      ];
    }

    try {
      const query = `
        SELECT a.*, c.name as courseName
        FROM assignments a
        JOIN courses c ON a.courseId = c.id
        WHERE c.teacherId = ?
        ORDER BY a.createdAt DESC
      `;

      const [rows] = await pool.query<RowDataPacket[]>(query, [teacherId]);
      
      return rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.dueDate,
        points: row.points,
        status: row.status,
        createdAt: row.createdAt,
        courseId: row.courseId,
        courseName: row.courseName
      }));
    } catch (error) {
      console.error('Error finding assignments by teacherId:', error);
      // Return mock data on error
      return [
        {
          id: 'mock-assignment-1',
          title: 'Homework 1',
          description: 'Complete exercises 1-10',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          points: 100,
          status: 'pending',
          createdAt: new Date(),
          courseId: 'mock-course-1'
        }
      ];
    }
  }

  /**
   * Find recent assignments by teacher ID
   */
  async findRecent(teacherId: string, limit: number = 5): Promise<any[]> {
    if (!checkDbAvailability()) {
      // Return mock data if database is not available
      return [
        {
          id: 'mock-assignment-1',
          title: 'Recent Homework',
          description: 'Complete exercises 1-10',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          points: 100,
          status: 'pending',
          createdAt: new Date(),
          courseId: 'mock-course-1'
        }
      ];
    }

    try {
      const query = `
        SELECT a.*, c.name as courseName
        FROM assignments a
        JOIN courses c ON a.courseId = c.id
        WHERE c.teacherId = ?
        ORDER BY a.createdAt DESC
        LIMIT ?
      `;

      const [rows] = await pool.query<RowDataPacket[]>(query, [teacherId, limit]);
      
      return rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        dueDate: row.dueDate,
        points: row.points,
        status: row.status,
        createdAt: row.createdAt,
        courseId: row.courseId,
        courseName: row.courseName
      }));
    } catch (error) {
      console.error('Error finding recent assignments by teacherId:', error);
      // Return mock data on error
      return [
        {
          id: 'mock-assignment-1',
          title: 'Recent Homework',
          description: 'Complete exercises 1-10',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          points: 100,
          status: 'pending',
          createdAt: new Date(),
          courseId: 'mock-course-1'
        }
      ];
    }
  }
}

export const assignmentModel = new AssignmentModel(); 