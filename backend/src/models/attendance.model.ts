import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// Attendance status types
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Attendance interface
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  courseId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create DTO
export interface CreateAttendanceDTO {
  studentId: string;
  classId: string;
  courseId: string;
  date: Date;
  status: AttendanceStatus;
  notes?: string;
}

// Update DTO
export interface UpdateAttendanceDTO {
  status?: AttendanceStatus;
  notes?: string;
}

// Define the RowDataPacket extension for type safety
interface AttendanceRow extends Attendance, RowDataPacket {}

class AttendanceModel {
  /**
   * Create attendance table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        courseId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (studentId, classId, date)
      );
    `;
    await pool.query(query);
  }

  /**
   * Find attendance record by ID
   */
  async findById(id: string): Promise<Attendance | null> {
    const [rows] = await pool.query<AttendanceRow[]>(
      'SELECT * FROM attendance WHERE id = ?',
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new attendance record
   */
  async create(attendanceData: CreateAttendanceDTO): Promise<string> {
    const id = uuidv4();
    
    const query = `
      INSERT INTO attendance (
        id, studentId, classId, courseId, date, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<ResultSetHeader>(query, [
      id,
      attendanceData.studentId,
      attendanceData.classId,
      attendanceData.courseId,
      attendanceData.date,
      attendanceData.status,
      attendanceData.notes || null
    ]);
    
    return id;
  }

  /**
   * Update an attendance record
   */
  async update(id: string, attendanceData: UpdateAttendanceDTO): Promise<boolean> {
    // Build query dynamically based on provided fields
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(attendanceData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE attendance SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  /**
   * Delete an attendance record
   */
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM attendance WHERE id = ?';
    const [result] = await pool.query<ResultSetHeader>(query, [id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Get attendance records for a student
   */
  async getByStudentId(studentId: string, filters?: {
    courseId?: string;
    month?: number;
    year?: number;
    status?: AttendanceStatus;
  }): Promise<any[]> {
    let query = `
      SELECT a.*, c.name as courseName, c.code as courseCode
      FROM attendance a
      JOIN courses c ON a.courseId = c.id
      WHERE a.studentId = ?
    `;
    
    const params: any[] = [studentId];
    
    // Apply filters
    if (filters) {
      if (filters.courseId) {
        query += ' AND a.courseId = ?';
        params.push(filters.courseId);
      }
      
      if (filters.month !== undefined && filters.year !== undefined) {
        query += ' AND MONTH(a.date) = ? AND YEAR(a.date) = ?';
        params.push(filters.month, filters.year);
      }
      
      if (filters.status) {
        query += ' AND a.status = ?';
        params.push(filters.status);
      }
    }
    
    query += ' ORDER BY a.date DESC';
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    return rows.map((row: any) => ({
      ...row,
      date: row.date.toISOString().split('T')[0],
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString()
    }));
  }

  /**
   * Get attendance statistics for a student
   */
  async getAttendanceStats(studentId: string, courseId?: string): Promise<{
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    percentage: number;
  }> {
    let query = `
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused,
        COUNT(*) as total
      FROM attendance
      WHERE studentId = ?
    `;
    
    const params: any[] = [studentId];
    
    if (courseId) {
      query += ' AND courseId = ?';
      params.push(courseId);
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    
    const stats = rows[0] as any;
    const percentage = stats.total > 0 
      ? Math.round(((stats.present + stats.excused) / stats.total) * 100) 
      : 0;
    
    return {
      present: stats.present || 0,
      absent: stats.absent || 0,
      late: stats.late || 0,
      excused: stats.excused || 0,
      total: stats.total || 0,
      percentage
    };
  }

  /**
   * Get monthly attendance summary for a student
   */
  async getMonthlyAttendanceSummary(studentId: string, year: number): Promise<any[]> {
    const query = `
      SELECT 
        MONTH(date) as month,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'excused' THEN 1 END) as excused,
        COUNT(*) as total
      FROM attendance
      WHERE studentId = ? AND YEAR(date) = ?
      GROUP BY MONTH(date)
      ORDER BY MONTH(date)
    `;
    
    const [rows] = await pool.query<RowDataPacket[]>(query, [studentId, year]);
    
    return rows.map((row: any) => ({
      month: row.month,
      present: row.present || 0,
      absent: row.absent || 0,
      late: row.late || 0,
      excused: row.excused || 0,
      total: row.total || 0,
      percentage: row.total > 0 
        ? Math.round(((row.present + row.excused) / row.total) * 100) 
        : 0
    }));
  }
}

export const attendanceModel = new AttendanceModel(); 