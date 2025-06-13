/**
 * Seed script for login attempts
 */
const { createTableIfNotExists } = require('./utils');

/**
 * Seed login attempts
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @returns {object} - Status of operation
 */
async function seedLoginAttempts(connection, userData) {
  console.log('Creating login attempts...');
  
  // Extract user IDs
  const { studentId1, teacherId1, adminId } = userData;
  
  try {
    // Create login_attempts table if it doesn't exist
    await createTableIfNotExists(connection, 'login_attempts', `
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        ipAddress VARCHAR(45) NOT NULL,
        attemptTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        successful TINYINT(1) NOT NULL DEFAULT 0,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (email),
        INDEX (ipAddress),
        INDEX (attemptTime)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing login attempts
    await connection.query(`
      DELETE FROM login_attempts 
      WHERE userId IN (?, ?, ?)
    `, [studentId1, teacherId1, adminId]).catch(err => {
      console.warn('Warning when cleaning login_attempts:', err.message);
    });
    
    // Generate some login attempts
    
    // Successful login attempt for admin
    await connection.query(`
      INSERT INTO login_attempts (
        userId, email, ipAddress, attemptTime, successful
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      adminId,
      'admin@school.com',
      '192.168.1.100',
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      1
    ]);
    console.log('Created successful login attempt for admin');
    
    // Successful login attempt for teacher
    await connection.query(`
      INSERT INTO login_attempts (
        userId, email, ipAddress, attemptTime, successful
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      teacherId1,
      'teacher@school.com',
      '192.168.1.101',
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      1
    ]);
    console.log('Created successful login attempt for teacher');
    
    // Failed login attempt for student
    await connection.query(`
      INSERT INTO login_attempts (
        userId, email, ipAddress, attemptTime, successful
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      studentId1,
      'student@school.com',
      '192.168.1.102',
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      0
    ]);
    console.log('Created failed login attempt for student');
    
    // Successful login attempt for student (after failed attempt)
    await connection.query(`
      INSERT INTO login_attempts (
        userId, email, ipAddress, attemptTime, successful
      )
      VALUES (?, ?, ?, ?, ?)
    `, [
      studentId1,
      'student@school.com',
      '192.168.1.102',
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000), // 2 days ago + 5 minutes
      1
    ]);
    console.log('Created successful login attempt for student after failed attempt');
    
    return {
      success: true,
      message: 'Login attempts created successfully'
    };
  } catch (error) {
    console.error('Error creating login attempts:', error);
    throw error;
  }
}

module.exports = seedLoginAttempts; 