import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the attendance table
 */
export async function createAttendanceTable(): Promise<void> {
  logger.db('Creating attendance table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(36) PRIMARY KEY,
      courseId VARCHAR(36) NOT NULL,
      studentId VARCHAR(36) NOT NULL,
      date DATE NOT NULL,
      status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
      notes TEXT DEFAULT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_attendance (courseId, studentId, date),
      CONSTRAINT fk_attendance_course FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
      CONSTRAINT fk_attendance_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Attendance table created or already exists');
  } catch (error) {
    logger.error('Failed to create attendance table', error);
    throw error;
  }
} 