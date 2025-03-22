import { query } from '../config/db';
import { logger } from '../utils/logger';

/**
 * Migration to create the class schedules table
 */
export async function createClassSchedulesTable(): Promise<void> {
  logger.db('Creating class schedules table if it does not exist');
  
  const sql = `
    CREATE TABLE IF NOT EXISTS class_schedules (
      id VARCHAR(36) PRIMARY KEY,
      classId VARCHAR(36) NOT NULL,
      day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
      startTime TIME NOT NULL,
      endTime TIME NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_schedule_class FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `;
  
  try {
    await query(sql);
    logger.db('Class schedules table created or already exists');
  } catch (error) {
    logger.error('Failed to create class schedules table', error);
    throw error;
  }
} 