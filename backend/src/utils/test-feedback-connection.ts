import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface CountResult extends RowDataPacket {
  count: number;
}

async function testFeedbackConnection() {
  console.log('Starting feedback connection test...');
  
  try {
    console.log('Testing database connection...');
    // Simple query to test connection
    const [result] = await pool.query<RowDataPacket[]>('SELECT 1 as test');
    console.log('Database connection successful:', result);
    
    console.log('\nChecking if feedback table exists...');
    try {
      const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'feedback'");
      if (Array.isArray(tables) && tables.length > 0) {
        console.log('Feedback table exists!');
        
        // Try to query the table
        console.log('\nTrying to query the feedback table...');
        const [feedbackRows] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM feedback');
        console.log('Query successful. Feedback count:', feedbackRows[0].count);
      } else {
        console.log('Feedback table does not exist. Creating it...');
        await createFeedbackTable();
      }
    } catch (error) {
      console.error('Error checking for feedback table:', error);
      console.log('\nAttempting to create feedback table anyway...');
      await createFeedbackTable();
    }
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Connection pool closed.');
  }
}

async function createFeedbackTable() {
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
    console.log('Feedback table created successfully!');
    
    // Insert a test record
    const { v4: uuidv4 } = require('uuid');
    const uuid = uuidv4();
    await pool.query(`
      INSERT INTO feedback (id, studentId, courseId, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [uuid, 'test-student-id', 'test-course-id', 5, 'Test comment']);
    console.log('Test feedback record inserted successfully!');
    
  } catch (error) {
    console.error('Error creating feedback table:', error);
  }
}

// Run the function
testFeedbackConnection(); 