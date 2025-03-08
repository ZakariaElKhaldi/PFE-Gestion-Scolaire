import { pool } from '../config/db';
import { User, UserResponse, UserRole } from '../types/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Interface extending RowDataPacket for type safety with mysql2
interface UserRow extends User, RowDataPacket {}

class UserModel {
  /**
   * Create tables if they don't exist
   */
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        role ENUM('administrator', 'teacher', 'student', 'parent') NOT NULL,
        profilePicture VARCHAR(255),
        phoneNumber VARCHAR(20),
        studentId VARCHAR(50),
        bio TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await pool.query(query);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows.length ? rows[0] : null;
  }

  /**
   * Find user by id
   */
  async findById(id: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
  }

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
  }): Promise<string> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Generate UUID
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (
        id, email, password, firstName, lastName, role, phoneNumber
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await pool.query<ResultSetHeader>(query, [
      id,
      userData.email,
      hashedPassword,
      userData.firstName,
      userData.lastName,
      userData.role,
      userData.phoneNumber || null
    ]);
    
    return id;
  }

  /**
   * Get all users with optional role filter
   */
  async findAll(role?: UserRole): Promise<UserResponse[]> {
    let query = 'SELECT id, email, firstName, lastName, role, profilePicture, phoneNumber, studentId, createdAt, updatedAt, bio FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = ?';
      params.push(role);
    }
    
    const [rows] = await pool.query<UserRow[]>(query, params);
    return rows;
  }

  /**
   * Update user
   */
  async update(id: string, userData: Partial<Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
    // Build query dynamically based on provided fields
    const fields: string[] = [];
    const values: any[] = [];
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const [result] = await pool.query<ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }

  /**
   * Update password
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = 'UPDATE users SET password = ? WHERE id = ?';
    const [result] = await pool.query<ResultSetHeader>(query, [hashedPassword, id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await pool.query<ResultSetHeader>(query, [id]);
    
    return result.affectedRows > 0;
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const userModel = new UserModel(); 