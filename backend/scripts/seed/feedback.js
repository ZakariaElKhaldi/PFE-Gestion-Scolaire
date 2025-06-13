/**
 * Seed script for course feedback
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed course feedback
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @param {object} courseData - Course IDs from the courses seed
 * @returns {object} - Feedback IDs for reference
 */
async function seedFeedback(connection, userData, courseData) {
  console.log('Creating course feedback...');
  
  // Extract IDs
  const { studentId1, studentId2, studentId3 } = userData;
  const { course1Id, course2Id, course3Id } = courseData;
  
  try {
    // Create feedback table if it doesn't exist
    await createTableIfNotExists(connection, 'feedback', `
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
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing feedback
    await connection.query(`
      DELETE FROM feedback 
      WHERE studentId IN (?, ?, ?) AND courseId IN (?, ?, ?)
    `, [studentId1, studentId2, studentId3, course1Id, course2Id, course3Id]).catch(err => {
      console.warn('Warning when cleaning feedback:', err.message);
    });
    
    // Generate feedback IDs
    const feedbackId1 = uuidv4();
    const feedbackId2 = uuidv4();
    const feedbackId3 = uuidv4();
    const feedbackId4 = uuidv4();
    
    // Insert feedback from Student 1 for Math course
    await connection.query(`
      INSERT INTO feedback (
        id, studentId, courseId, rating, comment, status, teacherResponse, teacherResponseDate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      feedbackId1,
      studentId1,
      course1Id,
      5,
      'The course material is well-structured and the explanations are clear. The exercises help reinforce the concepts very well.',
      'reviewed',
      'Thank you for your positive feedback! We\'re glad you\'re finding the course helpful.',
      new Date()
    ]);
    console.log('Feedback created for Math course by Student 1');
    
    // Insert feedback from Student 2 for Math course
    await connection.query(`
      INSERT INTO feedback (
        id, studentId, courseId, rating, comment, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      feedbackId2,
      studentId2,
      course1Id,
      4,
      'Good course overall, but I would appreciate more practical examples related to real-world problems.',
      'pending'
    ]);
    console.log('Feedback created for Math course by Student 2');
    
    // Insert feedback from Student 3 for Physics course
    await connection.query(`
      INSERT INTO feedback (
        id, studentId, courseId, rating, comment, status, teacherResponse, teacherResponseDate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      feedbackId3,
      studentId3,
      course2Id,
      4,
      'The lab sessions are excellent, but I think the theoretical part could use more visual aids to help understand complex concepts.',
      'reviewed',
      'Thank you for your suggestion. We\'ll work on incorporating more visual elements in future lectures.',
      new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
    ]);
    console.log('Feedback created for Physics course by Student 3');
    
    // Insert feedback from Student 1 for Physics course
    await connection.query(`
      INSERT INTO feedback (
        id, studentId, courseId, rating, comment, status
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      feedbackId4,
      studentId1,
      course2Id,
      3,
      'The pace is a bit too fast for me. I would appreciate if we could spend more time on difficult topics.',
      'pending'
    ]);
    console.log('Feedback created for Physics course by Student 1');
    
    return {
      success: true,
      feedbackIds: {
        feedbackId1,
        feedbackId2,
        feedbackId3,
        feedbackId4
      },
      message: 'Course feedback created successfully'
    };
  } catch (error) {
    console.error('Error creating course feedback:', error);
    throw error;
  }
}

module.exports = seedFeedback; 