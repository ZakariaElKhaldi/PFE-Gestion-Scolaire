import * as mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

export enum RelationshipType {
  PARENT = 'parent',
  GUARDIAN = 'guardian',
  OTHER = 'other'
}

export enum RelationshipStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  PENDING_PARENT_REGISTRATION = 'pending_parent_registration'
}

export interface ParentRelationship {
  id: string;
  parentId: string | null; // Allow null for pending parent registration
  studentId: string;
  relationshipType: RelationshipType;
  description?: string;
  status: RelationshipStatus;
  verificationToken: string;
  tokenExpiry: Date;
  parentEmail?: string; // Email for parent when initiated by student
  parentFirstName?: string; // Optional parent details
  parentLastName?: string; // Optional parent details
  createdAt?: Date;
  updatedAt?: Date;
}

// Define additional properties accepted during creation
export interface ParentRelationshipCreationAttributes extends Omit<ParentRelationship, 'id' | 'verificationToken' | 'tokenExpiry' | 'createdAt' | 'updatedAt'> {
  verificationToken?: string;
  tokenExpiresAt?: Date;
}

class ParentRelationshipModel {
  /**
   * Create a new parent-student relationship
   */
  async create(relationship: ParentRelationshipCreationAttributes): Promise<ParentRelationship> {
    const id = uuidv4();
    
    const verificationToken = relationship.verificationToken || nanoid(32);
    const tokenExpiry = relationship.tokenExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
    
    // Handle additional fields for student-initiated relationships
    const hasParentInfo = !relationship.parentId && (relationship.parentEmail || relationship.parentFirstName || relationship.parentLastName);
    
    let query;
    let params;
    
    if (hasParentInfo) {
      // For student-initiated relationships with parent info
      query = `
        INSERT INTO parent_relationships 
        (id, parent_id, student_id, relationship_type, description, status, 
         verification_token, token_expiry, parent_email, parent_first_name, parent_last_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      params = [
        id,
        relationship.parentId || null,
        relationship.studentId,
        relationship.relationshipType,
        relationship.description || '',
        relationship.status,
        verificationToken,
        tokenExpiry,
        relationship.parentEmail || null,
        relationship.parentFirstName || null,
        relationship.parentLastName || null
      ];
    } else {
      // For regular parent-initiated relationships
      query = `
        INSERT INTO parent_relationships 
        (id, parent_id, student_id, relationship_type, description, status, verification_token, token_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      params = [
        id,
        relationship.parentId,
        relationship.studentId,
        relationship.relationshipType,
        relationship.description || '',
        relationship.status,
        verificationToken,
        tokenExpiry
      ];
    }
    
    await pool.execute(query, params);
    
    return this.getById(id) as Promise<ParentRelationship>;
  }
  
  /**
   * Get relationship by ID
   */
  async getById(id: string): Promise<ParentRelationship | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM parent_relationships WHERE id = ?`,
      [id]
    );
    
    const results = rows as any[];
    if (results.length === 0) {
      return null;
    }
    
    return this.mapRowToRelationship(results[0]);
  }
  
  /**
   * Get relationship by token
   */
  async getByToken(token: string): Promise<ParentRelationship | null> {
    const [rows] = await pool.execute(
      `SELECT * FROM parent_relationships WHERE verification_token = ?`,
      [token]
    );
    
    const results = rows as any[];
    if (results.length === 0) {
      return null;
    }
    
    return this.mapRowToRelationship(results[0]);
  }
  
  /**
   * Get all relationships for a parent
   */
  async getByParentId(parentId: string, status?: RelationshipStatus): Promise<ParentRelationship[]> {
    try {
      let query = `
        SELECT * FROM parent_relationships
        WHERE parent_id = ?
      `;
      
      const params: any[] = [parentId];
      
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
      
      const [rows] = await pool.query<RowDataPacket[]>(query, params);
      return rows.map(this.mapRowToRelationship);
    } catch (error) {
      console.error('Error fetching parent relationships by parent ID:', error);
      throw error;
    }
  }
  
  /**
   * Get relationships by parent email and status
   */
  async getByParentEmail(parentEmail: string, status: RelationshipStatus): Promise<ParentRelationship[]> {
    try {
      const query = `
        SELECT * FROM parent_relationships
        WHERE parent_email = ? AND status = ?
      `;
      
      const [rows] = await pool.query<RowDataPacket[]>(query, [parentEmail, status]);
      return rows.map(this.mapRowToRelationship);
    } catch (error) {
      console.error('Error fetching parent relationships by parent email:', error);
      throw error;
    }
  }
  
  /**
   * Get verified children for a parent
   */
  async getVerifiedChildren(parentId: string): Promise<ParentRelationship[]> {
    const [rows] = await pool.execute(
      `SELECT * FROM parent_relationships 
       WHERE parent_id = ? AND status = ?`,
      [parentId, RelationshipStatus.VERIFIED]
    );
    
    const results = rows as any[];
    return results.map(row => this.mapRowToRelationship(row));
  }
  
  /**
   * Update a relationship's status
   */
  async updateStatus(id: string, status: RelationshipStatus): Promise<ParentRelationship | null> {
    await pool.execute(
      `UPDATE parent_relationships SET status = ? WHERE id = ?`,
      [status, id]
    );
    
    return this.getById(id);
  }
  
  /**
   * Update verification token
   */
  async updateVerificationToken(id: string): Promise<{ token: string; expiry: Date } | null> {
    const token = nanoid(32);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // Expire in 7 days
    
    await pool.execute(
      `UPDATE parent_relationships 
       SET verification_token = ?, token_expiry = ? 
       WHERE id = ?`,
      [token, expiry, id]
    );
    
    return { token, expiry };
  }
  
  /**
   * Check if verification token is valid
   */
  async isTokenValid(token: string): Promise<boolean> {
    const [rows] = await pool.execute(
      `SELECT * FROM parent_relationships 
       WHERE verification_token = ? AND token_expiry > NOW()`,
      [token]
    );
    
    const results = rows as any[];
    return results.length > 0;
  }
  
  /**
   * Map database row to relationship object
   */
  private mapRowToRelationship(row: any): ParentRelationship {
    return {
      id: row.id,
      parentId: row.parent_id,
      studentId: row.student_id,
      relationshipType: row.relationship_type as RelationshipType,
      description: row.description,
      status: row.status as RelationshipStatus,
      verificationToken: row.verification_token,
      tokenExpiry: new Date(row.token_expiry),
      parentEmail: row.parent_email,
      parentFirstName: row.parent_first_name,
      parentLastName: row.parent_last_name,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    };
  }

  /**
   * Create a new parent-student relationship using an existing database connection (for transactions)
   */
  async createWithConnection(
    connection: any, 
    relationship: ParentRelationshipCreationAttributes
  ): Promise<ParentRelationship> {
    try {
      const id = uuidv4();
      
      const verificationToken = relationship.verificationToken || nanoid(32);
      const tokenExpiry = relationship.tokenExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
      
      const insertFields = [
        'id', 'student_id', 'relationship_type', 'status', 
        'verification_token', 'token_expiry', 'created_at', 'updated_at'
      ];
      const insertValues = [
        id, relationship.studentId, relationship.relationshipType, 
        relationship.status, verificationToken, tokenExpiry, new Date(), new Date()
      ];
      
      // Add optional fields if they exist
      if (relationship.parentId) {
        insertFields.push('parent_id');
        insertValues.push(relationship.parentId);
      }
      
      if (relationship.description) {
        insertFields.push('description');
        insertValues.push(relationship.description);
      }
      
      if (relationship.parentEmail) {
        insertFields.push('parent_email');
        insertValues.push(relationship.parentEmail);
      }
      
      if (relationship.parentFirstName) {
        insertFields.push('parent_first_name');
        insertValues.push(relationship.parentFirstName);
      }
      
      if (relationship.parentLastName) {
        insertFields.push('parent_last_name');
        insertValues.push(relationship.parentLastName);
      }
      
      const query = `
        INSERT INTO parent_relationships (${insertFields.join(', ')})
        VALUES (${insertValues.map(() => '?').join(', ')})
      `;
      
      await connection.query(query, insertValues);
      
      // Return the created relationship
      return {
        id,
        parentId: relationship.parentId || null,
        studentId: relationship.studentId,
        relationshipType: relationship.relationshipType,
        description: relationship.description || '',
        status: relationship.status,
        verificationToken,
        tokenExpiry,
        parentEmail: relationship.parentEmail,
        parentFirstName: relationship.parentFirstName,
        parentLastName: relationship.parentLastName,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error creating parent relationship with connection:', error);
      throw error;
    }
  }
}

export const parentRelationshipModel = new ParentRelationshipModel(); 