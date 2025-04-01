import { promisify } from 'util';
import { pool } from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// Define submission status type for reuse
export type SubmissionStatus = 'submitted' | 'graded' | 'late';

// Submission types
export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: Date;
  status: SubmissionStatus;
  submissionUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

export interface CreateSubmissionDTO {
  assignmentId: string;
  studentId: string;
  submissionUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status?: SubmissionStatus;
}

export interface UpdateSubmissionDTO {
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  status?: SubmissionStatus;
}

// Define the RowDataPacket extension for type safety
interface SubmissionRow extends Submission, RowDataPacket {}

export class SubmissionModel {
  /**
   * Create submission table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        assignmentId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        grade FLOAT,
        feedback TEXT,
        gradedBy VARCHAR(36),
        gradedAt TIMESTAMP NULL,
        status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
        submissionUrl VARCHAR(255),
        fileName VARCHAR(255),
        fileType VARCHAR(100),
        fileSize INT,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(query);
  }

  /**
   * Get all submissions with optional filters
   */
  async findAll(filters?: {
    assignmentId?: string;
    studentId?: string;
    status?: 'submitted' | 'graded' | 'late';
  }): Promise<Submission[]> {
    let query = 'SELECT * FROM submissions';
    const params: any[] = [];
    
    // Build WHERE clause if filters are provided
    if (filters) {
      const conditions: string[] = [];
      
      if (filters.assignmentId) {
        conditions.push('assignmentId = ?');
        params.push(filters.assignmentId);
      }
      
      if (filters.studentId) {
        conditions.push('studentId = ?');
        params.push(filters.studentId);
      }
      
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }
    
    query += ' ORDER BY submittedAt DESC';
    
    const [rows] = await pool.query<SubmissionRow[]>(query, params);
    return rows;
  }

  /**
   * Get submission by ID
   */
  async findById(id: string): Promise<Submission | null> {
    const [rows] = await pool.query<SubmissionRow[]>(
      'SELECT * FROM submissions WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Get submission by assignment and student
   */
  async findByAssignmentAndStudent(assignmentId: string, studentId: string): Promise<Submission | null> {
    const [rows] = await pool.query<SubmissionRow[]>(
      'SELECT * FROM submissions WHERE assignmentId = ? AND studentId = ?',
      [assignmentId, studentId]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new submission
   */
  async create(submissionData: CreateSubmissionDTO): Promise<Submission> {
    try {
      const id = uuidv4();
      
      // First check if submission already exists
      const existingSubmission = await this.findByAssignmentAndStudent(
        submissionData.assignmentId,
        submissionData.studentId
      );
      
      if (existingSubmission) {
        // Update existing submission
        const fields = ['submittedAt = NOW()'];
        const values: any[] = [];
        
        // Only add status if it's provided and valid
        if (submissionData.status && 
            (submissionData.status === 'submitted' || 
             submissionData.status === 'graded' || 
             submissionData.status === 'late')) {
          fields.push('status = ?');
          values.push(submissionData.status);
        }
        
        if (submissionData.submissionUrl) {
          fields.push('submissionUrl = ?');
          values.push(submissionData.submissionUrl);
        }
        
        const query = `
          UPDATE submissions 
          SET ${fields.join(', ')} 
          WHERE id = ?
        `;
        
        const queryValues = [...values, existingSubmission.id];
        await pool.query<OkPacket>(query, queryValues);
        
        return {
          ...existingSubmission,
          ...submissionData,
          submittedAt: new Date(existingSubmission.submittedAt)
        } as Submission;
      }
      
      // Create new submission
      const query = `
        INSERT INTO submissions (
          id, assignmentId, studentId, status, submissionUrl, fileName, fileType, fileSize
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      // Ensure status is a valid value
      const status: SubmissionStatus = 
        submissionData.status === 'submitted' || 
        submissionData.status === 'graded' || 
        submissionData.status === 'late' ? 
        submissionData.status : 'submitted';
      
      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, [
        id,
        submissionData.assignmentId,
        submissionData.studentId,
        status,
        submissionData.submissionUrl || null,
        submissionData.fileName || null,
        submissionData.fileType || null,
        submissionData.fileSize || null
      ]);
      
      return {
        id,
        ...submissionData,
        status,
        submittedAt: new Date()
      } as Submission;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  /**
   * Grade a submission
   */
  async grade(id: string, grade: number, feedback?: string): Promise<boolean> {
    const query = `
      UPDATE submissions 
      SET grade = ?, feedback = ?, status = 'graded'
      WHERE id = ?
    `;
    
    const [result] = await pool.query<OkPacket>(query, [grade, feedback || null, id]);
    return result.affectedRows > 0;
  }

  /**
   * Get submissions by assignment
   */
  async getByAssignment(assignmentId: string): Promise<Submission[]> {
    const [rows] = await pool.query<SubmissionRow[]>(
      'SELECT * FROM submissions WHERE assignmentId = ? ORDER BY submittedAt DESC',
      [assignmentId]
    );
    return rows;
  }

  /**
   * Get submissions by student
   */
  async getByStudent(studentId: string): Promise<Submission[]> {
    const [rows] = await pool.query<SubmissionRow[]>(
      'SELECT * FROM submissions WHERE studentId = ? ORDER BY submittedAt DESC',
      [studentId]
    );
    return rows;
  }

  /**
   * Get submissions with assignment details for a student
   */
  async getSubmissionsWithAssignmentDetails(studentId: string): Promise<any[]> {
    const query = `
      SELECT s.*, a.title as assignmentTitle, a.dueDate, a.points, 
             c.id as courseId, c.name as courseName, c.code as courseCode
      FROM submissions s
      JOIN assignments a ON s.assignmentId = a.id
      JOIN courses c ON a.courseId = c.id
      WHERE s.studentId = ?
      ORDER BY s.submittedAt DESC
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [studentId]);
    return rows;
  }

  /**
   * Get submissions with student details for an assignment
   */
  async getSubmissionsWithStudentDetails(assignmentId: string): Promise<any[]> {
    const query = `
      SELECT s.*, u.firstName, u.lastName, u.email
      FROM submissions s
      JOIN users u ON s.studentId = u.id
      WHERE s.assignmentId = ?
      ORDER BY u.lastName, u.firstName
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [assignmentId]);
    return rows;
  }

  /**
   * Count submissions for an assignment
   */
  async countByAssignment(assignmentId: string, status?: 'submitted' | 'graded' | 'late'): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM submissions WHERE assignmentId = ?';
    const params = [assignmentId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows[0].count;
  }
  
  /**
   * Get average grade for an assignment
   */
  async getAverageGradeForAssignment(assignmentId: string): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT AVG(grade) as average FROM submissions WHERE assignmentId = ? AND grade IS NOT NULL',
      [assignmentId]
    );
    
    // If no grades yet, return null
    if (rows[0].average === null) {
      return null;
    }
    
    return parseFloat(rows[0].average);
  }

  /**
   * Update a submission
   */
  async update(id: string, updates: UpdateSubmissionDTO): Promise<boolean> {
    try {
      let query = 'UPDATE submissions SET ';
      const queryParams: any[] = [];
      const updateFields: string[] = [];
      
      if (updates.grade !== undefined) {
        updateFields.push('grade = ?');
        queryParams.push(updates.grade);
      }
      
      if (updates.feedback !== undefined) {
        updateFields.push('feedback = ?');
        queryParams.push(updates.feedback);
      }
      
      if (updates.gradedBy !== undefined) {
        updateFields.push('gradedBy = ?');
        queryParams.push(updates.gradedBy);
      }
      
      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        queryParams.push(updates.status);
      }
      
      if (updateFields.length === 0) {
        return true; // Nothing to update
      }
      
      query += updateFields.join(', ');
      query += ' WHERE id = ?';
      queryParams.push(id);

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, queryParams);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating submission:', error);
      throw error;
    }
  }
}

// SQL to create the submissions table
export const createSubmissionsTableSQL = `
  CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignmentId VARCHAR(36) NOT NULL,
    studentId VARCHAR(36) NOT NULL,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade FLOAT,
    feedback TEXT,
    gradedBy VARCHAR(36),
    gradedAt TIMESTAMP NULL,
    status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
    submissionUrl VARCHAR(255),
    fileName VARCHAR(255),
    fileType VARCHAR(100),
    fileSize INT,
    FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Initialize the submissions table
export const initializeSubmissionsTable = async () => {
  try {
    console.log('Initializing submissions table');
    const [result] = await pool.query(createSubmissionsTableSQL);
    console.log('Submissions table initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize submissions table:', error);
    return false;
  }
};

// Initialize the table when the model is loaded
initializeSubmissionsTable()
  .then(result => {
    if (result) {
      console.log('Submissions table ready');
    }
  })
  .catch(err => {
    console.error('Error during submissions table initialization:', err);
  });

// Export the singleton instance of SubmissionModel
export const submissionModel = new SubmissionModel(); 