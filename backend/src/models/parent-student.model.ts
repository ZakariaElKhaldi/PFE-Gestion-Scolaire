import { pool } from '../config/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Relationship status types
export type RelationshipStatus = 'pending' | 'verified' | 'rejected';

// Relationship types
export type RelationshipType = 'mother' | 'father' | 'guardian' | 'other';

// Interface for parent-student relationship
export interface ParentStudentRelationship {
  id: string;
  parentId: string | null; // Can be null when initially created
  studentId: string;
  relationshipType: RelationshipType;
  status: RelationshipStatus;
  verificationToken: string;
  verificationTokenExpiry: Date;
  email: string; // Email of the parent for verification
  phoneNumber?: string; // Optional phone number of the parent
  createdAt: Date;
  updatedAt: Date;
}

// Interface for database rows
interface ParentStudentRelationshipRow extends ParentStudentRelationship, RowDataPacket {}

class ParentStudentRelationshipModel {
  /**
   * Create table if it doesn't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS parent_student_relationships (
        id VARCHAR(36) PRIMARY KEY,
        parentId VARCHAR(36),
        studentId VARCHAR(36) NOT NULL,
        relationshipType ENUM('mother', 'father', 'guardian', 'other') NOT NULL,
        status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
        verificationToken VARCHAR(255) NOT NULL,
        verificationTokenExpiry DATETIME NOT NULL,
        email VARCHAR(255) NOT NULL,
        phoneNumber VARCHAR(20),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(query);
  }

  /**
   * Create a new parent-student relationship
   */
  async create(data: {
    studentId: string;
    relationshipType: RelationshipType;
    email: string;
    phoneNumber?: string;
  }): Promise<{ id: string; verificationToken: string; }> {
    // Generate UUID for the relationship
    const id = uuidv4();
    
    // Generate verification token (64 character random string)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry (48 hours from now)
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 48);
    
    const query = `
      INSERT INTO parent_student_relationships (
        id, studentId, relationshipType, status, verificationToken, 
        verificationTokenExpiry, email, phoneNumber
      ) VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
    `;
    
    await pool.query<ResultSetHeader>(query, [
      id,
      data.studentId,
      data.relationshipType,
      verificationToken,
      verificationTokenExpiry,
      data.email,
      data.phoneNumber || null
    ]);
    
    return { id, verificationToken };
  }

  /**
   * Find a relationship by verification token
   */
  async findByVerificationToken(token: string): Promise<ParentStudentRelationship | null> {
    const [rows] = await pool.query<ParentStudentRelationshipRow[]>(
      'SELECT * FROM parent_student_relationships WHERE verificationToken = ?',
      [token]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Find relationships by student ID
   */
  async findByStudentId(studentId: string): Promise<ParentStudentRelationship[]> {
    const [rows] = await pool.query<ParentStudentRelationshipRow[]>(
      'SELECT * FROM parent_student_relationships WHERE studentId = ?',
      [studentId]
    );
    return rows;
  }

  /**
   * Find relationships by parent ID
   */
  async findByParentId(parentId: string): Promise<ParentStudentRelationship[]> {
    const [rows] = await pool.query<ParentStudentRelationshipRow[]>(
      'SELECT * FROM parent_student_relationships WHERE parentId = ?',
      [parentId]
    );
    return rows;
  }

  /**
   * Find active relationships by parent ID (status = 'verified')
   */
  async findActiveByParentId(parentId: string): Promise<ParentStudentRelationship[]> {
    const [rows] = await pool.query<ParentStudentRelationshipRow[]>(
      'SELECT * FROM parent_student_relationships WHERE parentId = ? AND status = ?',
      [parentId, 'verified']
    );
    return rows;
  }

  /**
   * Verify a relationship by associating it with a parent
   */
  async verifyRelationship(
    token: string, 
    parentId: string
  ): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE parent_student_relationships SET parentId = ?, status = ? WHERE verificationToken = ? AND verificationTokenExpiry > NOW()',
      [parentId, 'verified', token]
    );
    return result.affectedRows > 0;
  }

  /**
   * Reject a relationship
   */
  async rejectRelationship(token: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE parent_student_relationships SET status = ? WHERE verificationToken = ? AND verificationTokenExpiry > NOW()',
      ['rejected', token]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if a token is valid (not expired and exists)
   */
  async isTokenValid(token: string): Promise<boolean> {
    const [rows] = await pool.query<ParentStudentRelationshipRow[]>(
      'SELECT * FROM parent_student_relationships WHERE verificationToken = ? AND verificationTokenExpiry > NOW()',
      [token]
    );
    return rows.length > 0;
  }

  /**
   * Regenerate verification token for a relationship
   */
  async regenerateVerificationToken(relationshipId: string): Promise<string> {
    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set new expiry (48 hours from now)
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 48);
    
    await pool.query<ResultSetHeader>(
      'UPDATE parent_student_relationships SET verificationToken = ?, verificationTokenExpiry = ? WHERE id = ?',
      [verificationToken, verificationTokenExpiry, relationshipId]
    );
    
    return verificationToken;
  }
}

export const parentStudentRelationshipModel = new ParentStudentRelationshipModel(); 