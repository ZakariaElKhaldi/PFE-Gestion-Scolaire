import * as mysql from 'mysql2/promise';
import { config } from '../config';

export async function createParentRelationshipTable(): Promise<void> {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
    });

    console.log('Creating parent_relationships table...');

    // First, let's make sure the users table exists
    try {
      // Check if users table exists
      const [tables] = await connection.execute(`
        SHOW TABLES LIKE 'users';
      `);
      
      const tablesArray = tables as any[];
      if (tablesArray.length === 0) {
        console.log('Users table does not exist yet, creating it first...');
        
        // Create users table if it doesn't exist
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            firstName VARCHAR(100) NOT NULL,
            lastName VARCHAR(100) NOT NULL,
            role ENUM('administrator', 'teacher', 'student', 'parent') NOT NULL,
            profilePicture VARCHAR(255) DEFAULT NULL,
            phoneNumber VARCHAR(20) DEFAULT NULL,
            studentId VARCHAR(50) DEFAULT NULL,
            bio TEXT DEFAULT NULL,
            createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            departmentId VARCHAR(36) DEFAULT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
        `);
        
        console.log('Users table created successfully');
      } else {
        console.log('Users table already exists');
      }

      // Drop parent relationships table if it exists to recreate it
      await connection.execute(`
        DROP TABLE IF EXISTS parent_relationships;
      `);
      
      // Create table - note parent_id can be NULL for student-initiated relationships
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS parent_relationships (
          id VARCHAR(36) NOT NULL PRIMARY KEY,
          parent_id VARCHAR(36),
          student_id VARCHAR(36) NOT NULL,
          relationship_type ENUM('parent', 'guardian', 'other') NOT NULL DEFAULT 'parent',
          description VARCHAR(255) DEFAULT '',
          status ENUM('pending', 'verified', 'rejected', 'pending_parent_registration') NOT NULL DEFAULT 'pending',
          verification_token VARCHAR(64) NOT NULL,
          token_expiry DATETIME NOT NULL,
          parent_email VARCHAR(255) DEFAULT NULL,
          parent_first_name VARCHAR(100) DEFAULT NULL,
          parent_last_name VARCHAR(100) DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY (verification_token),
          UNIQUE KEY parent_student_unique (parent_id, student_id),
          INDEX (parent_id),
          INDEX (student_id),
          INDEX (parent_email),
          CONSTRAINT fk_parent_relationship_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
      `);

      // Add parent FK constraint separately (only for non-null parent_id values)
      await connection.execute(`
        ALTER TABLE parent_relationships
        ADD CONSTRAINT fk_parent_relationship_parent
        FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE;
      `);

      console.log('parent_relationships table created successfully');
    } catch (migrationError) {
      console.error('Error during migration step:', migrationError);
      throw migrationError;
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error creating parent_relationships table:', error);
    throw error;
  }
} 