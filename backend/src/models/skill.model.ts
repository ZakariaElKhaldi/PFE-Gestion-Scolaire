import { pool } from '../config/db';
import { promisify } from 'util';
import { RowDataPacket } from 'mysql2';

export interface Skill {
  id: string;
  studentId: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données de la base
interface SkillRow extends RowDataPacket {
  id: string;
  studentId: string;
  skillName: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export class SkillModel {
  /**
   * Get skills by student ID
   */
  static async findByStudentId(studentId: string): Promise<Skill[]> {
    try {
      if (!pool || typeof pool.query !== 'function') {
        console.log('Database pool not available, returning mock skills data');
        return [
          {
            id: 'mock-skill-1',
            studentId,
            skillName: 'Mock Skill',
            level: 'intermediate',
            progress: 75,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }

      const query = `
        SELECT id, studentId, skillName, level, progress, createdAt, updatedAt
        FROM skills 
        WHERE studentId = ?
        ORDER BY skillName
      `;

      const queryAsync = promisify<string, any[], SkillRow[]>(pool.query);
      const [rows] = await queryAsync(query, [studentId]);

      console.log(`Found ${rows.length} skills for student ${studentId}`);

      return rows.map((row: SkillRow) => ({
        id: row.id,
        studentId: row.studentId,
        skillName: row.skillName,
        level: row.level,
        progress: row.progress,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching skills by student ID:', error);
      return [];
    }
  }

  /**
   * Get all skills
   */
  static async findAll(): Promise<Skill[]> {
    try {
      if (!pool || typeof pool.query !== 'function') {
        console.log('Database pool not available, returning empty skills array');
        return [];
      }

      const query = `
        SELECT id, studentId, skillName, level, progress, createdAt, updatedAt
        FROM skills 
        ORDER BY skillName
      `;

      const queryAsync = promisify<string, any[], SkillRow[]>(pool.query);
      const [rows] = await queryAsync(query, []);

      return rows.map((row: SkillRow) => ({
        id: row.id,
        studentId: row.studentId,
        skillName: row.skillName,
        level: row.level,
        progress: row.progress,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      }));
    } catch (error) {
      console.error('Error fetching all skills:', error);
      return [];
    }
  }
}