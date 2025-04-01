import { pool } from '../config/db';

async function createFeedbackTable() {
  try {
    console.log('Creating database pool...');
    
    // First check if the table already exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'feedback'");
    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Feedback table already exists.');
      return;
    }
    
    // Create the feedback table
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
    
    console.log('Successfully created feedback table');
    
    // Add foreign key constraints separately so they don't fail if referenced tables don't exist
    try {
      await pool.query(`
        ALTER TABLE feedback 
        ADD CONSTRAINT fk_feedback_student 
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('Added foreign key constraint for studentId');
    } catch (error) {
      console.error('Failed to add studentId foreign key, but continuing:', error);
    }
    
    try {
      await pool.query(`
        ALTER TABLE feedback 
        ADD CONSTRAINT fk_feedback_course 
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      `);
      console.log('Added foreign key constraint for courseId');
    } catch (error) {
      console.error('Failed to add courseId foreign key, but continuing:', error);
    }
    
    console.log('Feedback table setup complete!');
  } catch (error) {
    console.error('Error creating feedback table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
createFeedbackTable(); 