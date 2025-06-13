import { pool } from '../config/db';
import { FieldPacket, RowDataPacket } from 'mysql2/promise';

// Interface for SHOW COLUMNS result
interface ColumnInfo extends RowDataPacket {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

/**
 * Add profile features to users table (profile picture and bio)
 */
export async function up(): Promise<void> {
  console.log('Adding profile features to users table...');
  
  try {
    // Check if columns already exist
    const [columnResults]: [ColumnInfo[], FieldPacket[]] = await pool.query('SHOW COLUMNS FROM users');
    const columns = columnResults.map((col: ColumnInfo) => col.Field);
    
    const queries: string[] = [];
    
    // Add profilePicture column if it doesn't exist
    if (!columns.includes('profilePicture')) {
      queries.push('ALTER TABLE users ADD COLUMN profilePicture VARCHAR(255) AFTER phoneNumber');
    }
    
    // Add bio column if it doesn't exist
    if (!columns.includes('bio')) {
      queries.push('ALTER TABLE users ADD COLUMN bio TEXT AFTER profilePicture');
    }
    
    // Execute queries if needed
    if (queries.length > 0) {
      await pool.query(queries.join(';'));
      console.log('Profile features added to users table');
    } else {
      console.log('Profile features already exist in the users table');
    }
    
  } catch (error) {
    console.error('Error adding profile features to users table:', error);
    throw error;
  }
}

/**
 * Remove profile features from users table
 */
export async function down(): Promise<void> {
  console.log('Removing profile features from users table...');
  
  try {
    // Check if columns exist
    const [columnResults]: [ColumnInfo[], FieldPacket[]] = await pool.query('SHOW COLUMNS FROM users');
    const columns = columnResults.map((col: ColumnInfo) => col.Field);
    
    const queries: string[] = [];
    
    // Remove bio column if it exists
    if (columns.includes('bio')) {
      queries.push('ALTER TABLE users DROP COLUMN bio');
    }
    
    // Remove profilePicture column if it exists
    if (columns.includes('profilePicture')) {
      queries.push('ALTER TABLE users DROP COLUMN profilePicture');
    }
    
    // Execute queries if needed
    if (queries.length > 0) {
      await pool.query(queries.join(';'));
      console.log('Profile features removed from users table');
    } else {
      console.log('Profile features already removed from users table');
    }
    
  } catch (error) {
    console.error('Error removing profile features from users table:', error);
    throw error;
  }
}

export const name = 'add_profile_features_to_users_table'; 