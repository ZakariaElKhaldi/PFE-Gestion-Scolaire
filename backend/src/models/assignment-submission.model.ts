import { promisify } from 'util';
import { pool } from '../config/db';
import { OkPacket, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: Date;
  documentId?: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

export interface CreateAssignmentSubmissionDTO {
  assignmentId: string;
  studentId: string;
  documentId?: string;
  status?: 'submitted' | 'graded' | 'late';
}

export interface UpdateAssignmentSubmissionDTO {
  documentId?: string;
  status?: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  gradedBy?: string;
}

export class AssignmentSubmissionModel {
  // Create a new submission
  static async create(submission: CreateAssignmentSubmissionDTO): Promise<AssignmentSubmission> {
    try {
      const id = uuidv4();
      const query = `
        INSERT INTO assignment_submissions 
        (id, assignmentId, studentId, documentId, status, submittedAt)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const status = submission.status || 'submitted';
      const values = [
        id,
        submission.assignmentId,
        submission.studentId,
        submission.documentId || null,
        status
      ];

      console.log('Creating assignment submission with values:', { 
        id, 
        assignmentId: submission.assignmentId, 
        studentId: submission.studentId 
      });

      const [result] = await pool.query<OkPacket>(query, values);

      return {
        id,
        assignmentId: submission.assignmentId,
        studentId: submission.studentId,
        documentId: submission.documentId,
        status: status,
        submittedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating assignment submission:', error);
      throw error;
    }
  }

  // Find a submission by ID
  static async findById(id: string): Promise<AssignmentSubmission | null> {
    try {
      const query = `
        SELECT * FROM assignment_submissions WHERE id = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [id]);

      if (rows.length === 0) {
        return null;
      }

      const submission = rows[0];
      return {
        id: submission.id.toString(),
        assignmentId: submission.assignmentId.toString(),
        studentId: submission.studentId.toString(),
        documentId: submission.documentId ? submission.documentId.toString() : undefined,
        status: submission.status,
        submittedAt: new Date(submission.submittedAt),
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt ? new Date(submission.gradedAt) : undefined,
        gradedBy: submission.gradedBy
      };
    } catch (error) {
      console.error('Error finding submission by id:', error);
      throw error;
    }
  }

  // Find submissions by assignment ID
  static async findByAssignment(assignmentId: string): Promise<AssignmentSubmission[]> {
    try {
      const query = `
        SELECT * FROM assignment_submissions 
        WHERE assignmentId = ?
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [assignmentId]);

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        assignmentId: row.assignmentId.toString(),
        studentId: row.studentId.toString(),
        documentId: row.documentId ? row.documentId.toString() : undefined,
        status: row.status,
        submittedAt: new Date(row.submittedAt),
        grade: row.grade,
        feedback: row.feedback,
        gradedAt: row.gradedAt ? new Date(row.gradedAt) : undefined,
        gradedBy: row.gradedBy
      }));
    } catch (error) {
      console.error('Error finding submissions by assignment:', error);
      throw error;
    }
  }

  // Find submissions by student ID
  static async findByStudent(studentId: string): Promise<AssignmentSubmission[]> {
    try {
      const query = `
        SELECT * FROM assignment_submissions 
        WHERE studentId = ?
        ORDER BY submittedAt DESC
      `;

      const queryAsync = promisify<string, any[], RowDataPacket[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId]);

      return rows.map((row: RowDataPacket) => ({
        id: row.id.toString(),
        assignmentId: row.assignmentId.toString(),
        studentId: row.studentId.toString(),
        documentId: row.documentId ? row.documentId.toString() : undefined,
        status: row.status,
        submittedAt: new Date(row.submittedAt),
        grade: row.grade,
        feedback: row.feedback,
        gradedAt: row.gradedAt ? new Date(row.gradedAt) : undefined,
        gradedBy: row.gradedBy
      }));
    } catch (error) {
      console.error('Error finding submissions by student:', error);
      throw error;
    }
  }

  // Update a submission
  static async update(id: string, updates: UpdateAssignmentSubmissionDTO): Promise<boolean> {
    try {
      let query = 'UPDATE assignment_submissions SET ';
      const queryParams: any[] = [];
      const updateFields: string[] = [];

      if (updates.documentId !== undefined) {
        updateFields.push('documentId = ?');
        queryParams.push(updates.documentId);
      }

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        queryParams.push(updates.status);
      }

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
        updateFields.push('gradedAt = NOW()');
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

  // Delete a submission
  static async delete(id: string): Promise<boolean> {
    try {
      const query = `
        DELETE FROM assignment_submissions WHERE id = ?
      `;

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, [id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting submission:', error);
      throw error;
    }
  }

  // Grade a submission
  static async gradeSubmission(id: string, grade: number, feedback: string, gradedBy: string): Promise<boolean> {
    try {
      const query = `
        UPDATE assignment_submissions
        SET grade = ?, feedback = ?, gradedBy = ?, gradedAt = NOW(), status = 'graded'
        WHERE id = ?
      `;

      const queryAsync = promisify<string, any[], OkPacket>(pool.query);
      const result = await queryAsync(query, [grade, feedback, gradedBy, id]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }
}

// Updated SQL for creating the assignment_submissions table
export const createAssignmentSubmissionsTableSQL = `
  CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignmentId VARCHAR(36) NOT NULL,
    studentId VARCHAR(36) NOT NULL,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    documentId VARCHAR(255),
    status ENUM('submitted', 'graded', 'late') DEFAULT 'submitted',
    grade DECIMAL(5,2),
    feedback TEXT,
    gradedAt TIMESTAMP NULL DEFAULT NULL,
    gradedBy VARCHAR(36),
    FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
  );
`;

// Initialize the table
export const initializeAssignmentSubmissionsTable = async () => {
  try {
    console.log('Initializing assignment_submissions table');
    const queryAsync = promisify<string, any[], OkPacket>(pool.query);
    await queryAsync(createAssignmentSubmissionsTableSQL, []);
    console.log('Assignment submissions table initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize assignment submissions table:', error);
    return false;
  }
};

// Initialize the table when the model is loaded
initializeAssignmentSubmissionsTable()
  .then(result => {
    if (result) {
      console.log('Assignment submissions table ready');
    }
  })
  .catch(err => {
    console.error('Error during assignment submissions table initialization:', err);
  }); 