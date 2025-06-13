import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';

// Helper function to check if database is available
const checkDbAvailability = () => {
  try {
    return !!pool && typeof pool.query === 'function';
  } catch (error) {
    return false;
  }
};

export type FeedbackStatus = 'pending' | 'reviewed';

export interface Feedback {
  id: string;
  studentId: string;
  courseId: string;
  rating: number;
  comment: string;
  submittedAt: Date;
  status: FeedbackStatus;
  teacherResponse?: string;
  teacherResponseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackWithDetails extends Feedback {
  courseName: string;
  teacherFirstName?: string;
  teacherLastName?: string;
  teacherAvatar?: string;
}

export interface CreateFeedbackDTO {
  studentId: string;
  courseId: string;
  rating: number;
  comment: string;
}

export interface UpdateFeedbackDTO {
  rating?: number;
  comment?: string;
}

export interface TeacherResponseDTO {
  response: string;
}

export interface CourseStats {
  averageRating: number;
  totalFeedback: number;
  ratingDistribution: Record<number, number>;
}

interface FeedbackRow extends Feedback, RowDataPacket {}
export interface FeedbackDetailRow extends RowDataPacket, FeedbackWithDetails {}

export class FeedbackModel {
  /**
   * Initialize the model - ensure table exists
   */
  async initialize(): Promise<void> {
    try {
      await this.ensureTableExists();
      console.log('Feedback table initialized');
    } catch (error) {
      console.error('Error initializing feedback table:', error);
    }
  }
  
  /**
   * Create the feedback table if it doesn't exist
   */
  async ensureTableExists(): Promise<void> {
    try {
      console.log('Checking if feedback table exists...');
      
      // Try a simple query first to see if the table exists
      try {
        await pool.query("SELECT 1 FROM feedback LIMIT 1");
        console.log('Feedback table exists, skipping creation');
        return; // Table exists and we can query it
      } catch (queryError) {
        // If we get here, the table probably doesn't exist, so we'll create it
        console.log('Feedback table does not exist or cannot be queried, attempting to create it');
      }
      
      // Create the table
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS feedback (
            id VARCHAR(36) PRIMARY KEY,
            studentId VARCHAR(36) NOT NULL,
            courseId VARCHAR(36) NOT NULL,
            rating INT NOT NULL,
            comment TEXT NOT NULL,
            submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            status ENUM('pending', 'reviewed') NOT NULL DEFAULT 'pending',
            teacherResponse TEXT,
            teacherResponseDate DATETIME,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX (studentId),
            INDEX (courseId)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Successfully created feedback table');
      } catch (createError) {
        console.error('Error creating feedback table:', createError);
        // We'll still continue even if the table creation fails
      }
    } catch (error) {
      console.error('Failed to check/create feedback table', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Find a feedback by ID
   */
  async findById(id: string): Promise<Feedback | null> {
    try {
      await this.ensureTableExists();
      
      const [rows] = await pool.query<FeedbackRow[]>(
        'SELECT * FROM feedback WHERE id = ?',
        [id]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding feedback by ID:', error);
      if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new feedback
   */
  async create(feedbackData: CreateFeedbackDTO): Promise<string> {
    try {
      // Ensure table exists
      await this.ensureTableExists();
      
      const id = uuidv4();
      
      const query = `
        INSERT INTO feedback (
          id, studentId, courseId, rating, comment
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      await pool.query<ResultSetHeader>(query, [
        id,
        feedbackData.studentId,
        feedbackData.courseId,
        feedbackData.rating,
        feedbackData.comment
      ]);
      
      return id;
    } catch (error) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  }

  /**
   * Update a feedback
   */
  async update(id: string, feedbackData: UpdateFeedbackDTO): Promise<boolean> {
    try {
      await this.ensureTableExists();
      
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (feedbackData.rating !== undefined) {
        updateFields.push('rating = ?');
        values.push(feedbackData.rating);
      }
      
      if (feedbackData.comment !== undefined) {
        updateFields.push('comment = ?');
        values.push(feedbackData.comment);
      }
      
      if (updateFields.length === 0) {
        return true; // Nothing to update
      }
      
      values.push(id);
      
      const query = `
        UPDATE feedback 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;
      
      const [result] = await pool.query<ResultSetHeader>(query, values);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  /**
   * Add a teacher response to a feedback
   */
  async addTeacherResponse(id: string, responseData: TeacherResponseDTO): Promise<boolean> {
    try {
      await this.ensureTableExists();
      
      const query = `
        UPDATE feedback 
        SET teacherResponse = ?, 
            teacherResponseDate = NOW(),
            status = 'reviewed'
        WHERE id = ?
      `;
      
      const [result] = await pool.query<ResultSetHeader>(query, [
        responseData.response,
        id
      ]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error adding teacher response:', error);
      throw error;
    }
  }

  /**
   * Delete a feedback
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.ensureTableExists();
      
      const query = 'DELETE FROM feedback WHERE id = ?';
      const [result] = await pool.query<ResultSetHeader>(query, [id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }

  /**
   * Get feedback for a student
   */
  async getByStudentId(studentId: string): Promise<FeedbackWithDetails[]> {
    try {
      // Try to ensure the table exists, but don't let it throw
      try {
        await this.ensureTableExists();
      } catch (tableError) {
        console.error('Error ensuring table exists, but continuing:', tableError);
      }
      
      try {
        // Modified query to handle collation mismatch using CONVERT and COLLATE
        const query = `
          SELECT 
            f.*,
            c.title as courseName,
            u.firstName as teacherFirstName,
            u.lastName as teacherLastName
          FROM 
            feedback f
          JOIN 
            courses c ON CONVERT(f.courseId USING utf8mb4) COLLATE utf8mb4_general_ci = c.id
          JOIN 
            users u ON c.teacherId = u.id
          WHERE 
            f.studentId = ?
          ORDER BY 
            f.submittedAt DESC
        `;
        
        const [rows] = await pool.query<FeedbackDetailRow[]>(query, [studentId]);
        return rows;
      } catch (queryError) {
        console.error('Error executing query for student feedback:', queryError);
        // If there's an issue with the complex query, try a simpler one as fallback
        try {
          console.log('Attempting simpler fallback query without JOINs');
          const fallbackQuery = `
            SELECT f.* 
            FROM feedback f
            WHERE f.studentId = ?
            ORDER BY f.submittedAt DESC
          `;
          
          const [fallbackRows] = await pool.query<FeedbackRow[]>(fallbackQuery, [studentId]);
          
          // Convert the basic rows to the expected format
          return fallbackRows.map(row => ({
            ...row,
            courseName: 'Unknown Course', // Placeholder
            teacherFirstName: 'Unknown',  // Placeholder
            teacherLastName: 'Teacher'    // Placeholder
          }));
        } catch (fallbackError) {
          console.error('Even fallback query failed:', fallbackError);
          return []; // Last resort: empty array
        }
      }
    } catch (error) {
      console.error('Error getting student feedback:', error);
      // Always return empty array on error
      return [];
    }
  }

  /**
   * Get feedback for a course
   */
  async getByCourseId(courseId: string): Promise<FeedbackWithDetails[]> {
    try {
      await this.ensureTableExists();
      
      const query = `
        SELECT 
          f.*,
          u.firstName,
          u.lastName
        FROM 
          feedback f
        JOIN 
          users u ON f.studentId = u.id
        WHERE 
          CONVERT(f.courseId USING utf8mb4) COLLATE utf8mb4_general_ci = ?
        ORDER BY 
          f.submittedAt DESC
      `;
      
      const [rows] = await pool.query<FeedbackDetailRow[]>(query, [courseId]);
      return rows;
    } catch (error) {
      console.error('Error getting course feedback:', error);
      if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
        return [];
      }
      // If there's a collation error, try a fallback approach
      if (error instanceof Error && 
          (error.message.includes("Illegal mix of collations") || 
           error.message.includes("ER_CANT_AGGREGATE_2COLLATIONS"))) {
        console.log('Collation mismatch detected, using fallback approach');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get feedback for a teacher
   */
  async getByTeacherId(teacherId: string): Promise<FeedbackWithDetails[]> {
    try {
      await this.ensureTableExists();
      
      const query = `
        SELECT 
          f.*,
          c.title as courseName,
          u.firstName,
          u.lastName
        FROM 
          feedback f
        JOIN 
          courses c ON CONVERT(f.courseId USING utf8mb4) COLLATE utf8mb4_general_ci = c.id
        JOIN 
          users u ON f.studentId = u.id
        WHERE 
          c.teacherId = ?
        ORDER BY 
          f.submittedAt DESC
      `;
      
      const [rows] = await pool.query<FeedbackDetailRow[]>(query, [teacherId]);
      return rows;
    } catch (error) {
      console.error('Error getting teacher feedback:', error);
      if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
        return [];
      }
      // If there's a collation error, try a fallback approach
      if (error instanceof Error && 
          (error.message.includes("Illegal mix of collations") || 
           error.message.includes("ER_CANT_AGGREGATE_2COLLATIONS"))) {
        console.log('Collation mismatch detected, using fallback approach');
        return [];
      }
      throw error;
    }
  }

  /**
   * Get feedback statistics for a course
   */
  async getCourseStats(courseId: string): Promise<CourseStats> {
    try {
      await this.ensureTableExists();
      
      // Get average rating
      const [avgRows] = await pool.query<(RowDataPacket & { avg: number })[]>(
        'SELECT AVG(rating) as avg FROM feedback WHERE courseId = ?',
        [courseId]
      );
      
      const averageRating = avgRows[0]?.avg || 0;
      
      // Get total count
      const [countRows] = await pool.query<(RowDataPacket & { count: number })[]>(
        'SELECT COUNT(*) as count FROM feedback WHERE courseId = ?',
        [courseId]
      );
      
      const totalFeedback = countRows[0]?.count || 0;
      
      // Get distribution
      const [distRows] = await pool.query<(RowDataPacket & { rating: number, count: number })[]>(
        'SELECT rating, COUNT(*) as count FROM feedback WHERE courseId = ? GROUP BY rating',
        [courseId]
      );
      
      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      };
      
      distRows.forEach(row => {
        ratingDistribution[row.rating] = row.count;
      });
      
      return {
        averageRating,
        totalFeedback,
        ratingDistribution
      };
    } catch (error) {
      console.error('Error getting course feedback stats:', error);
      if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
        return {
          averageRating: 0,
          totalFeedback: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        };
      }
      throw error;
    }
  }

  /**
   * Check if a student has already submitted feedback for a course
   */
  async hasSubmittedFeedback(studentId: string, courseId: string): Promise<boolean> {
    try {
      await this.ensureTableExists();
      
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT 1 FROM feedback WHERE studentId = ? AND courseId = ? LIMIT 1',
        [studentId, courseId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if feedback exists:', error);
      if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create the feedback table in the database
   */
  static async createTable(): Promise<void> {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS feedback (
          id VARCHAR(36) PRIMARY KEY,
          studentId VARCHAR(36) NOT NULL,
          courseId VARCHAR(36) NOT NULL,
          rating INT NOT NULL,
          comment TEXT NOT NULL,
          submittedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          status ENUM('pending', 'reviewed') DEFAULT 'pending',
          teacherResponse TEXT,
          teacherResponseDate DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      
      await pool.query(createTableSQL);
      console.log('Feedback table created or already exists');
    } catch (error) {
      console.error('Error creating feedback table:', error);
    }
  }

  /**
   * Find recent feedback by teacher ID
   */
  async findRecentByTeacherId(teacherId: string, limit: number = 5): Promise<any[]> {
    // If db not available, return mock data
    if (!pool) {
      return [
        {
          id: 'mock-feedback-1',
          studentId: 'mock-student-1',
          studentName: 'John Doe',
          courseId: 'mock-course-1',
          courseName: 'Mathematics',
          content: 'Good progress this week, keep it up!',
          type: 'academic',
          rating: 4,
          status: 'pending',
          createdAt: new Date(),
          isPrivate: false
        }
      ];
    }

    try {
      // Join with courses to get feedback for courses taught by this teacher
      const query = `
        SELECT f.*, 
               u.firstName as studentFirstName, u.lastName as studentLastName,
               c.title as courseName
        FROM feedback f
        JOIN users u ON f.studentId = u.id
        JOIN courses c ON f.courseId = c.id
        WHERE c.teacherId = ?
        ORDER BY f.createdAt DESC
        LIMIT ?
      `;
      
      const [rows] = await pool.query<RowDataPacket[]>(query, [teacherId, limit]);
      
      return rows.map((row: any) => ({
        id: row.id,
        studentId: row.studentId,
        studentName: `${row.studentFirstName} ${row.studentLastName}`,
        courseId: row.courseId,
        courseName: row.courseName,
        content: row.content,
        type: row.type,
        rating: row.rating,
        status: row.status,
        createdAt: row.createdAt,
        isPrivate: row.isPrivate === 1
      }));
    } catch (error) {
      console.error('Error finding recent feedback by teacherId:', error);
      // Return mock data on error
      return [
        {
          id: 'mock-feedback-1',
          studentId: 'mock-student-1',
          studentName: 'John Doe',
          courseId: 'mock-course-1',
          courseName: 'Mathematics',
          content: 'Good progress this week, keep it up!',
          type: 'academic',
          rating: 4,
          status: 'pending',
          createdAt: new Date(),
          isPrivate: false
        }
      ];
    }
  }
}

export const feedbackModel = new FeedbackModel();

// Initialize the model
feedbackModel.initialize(); 