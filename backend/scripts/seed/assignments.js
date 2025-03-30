/**
 * Seed script for assignments and submissions
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed assignments and submissions
 * @param {object} connection - MySQL connection
 * @param {object} courseData - Course IDs from courses seed
 * @param {object} userData - User IDs from users seed
 * @returns {object} - Assignment IDs for use in other seed modules
 */
async function seedAssignments(connection, courseData, userData) {
  console.log('Creating assignments and submissions...');
  
  // Extract IDs
  const { course1Id, course2Id, course3Id } = courseData;
  const { teacherId1, teacherId2, studentId1, studentId2, studentId3 } = userData;
  
  try {
    // Create assignments table if it doesn't exist
    await createTableIfNotExists(connection, 'assignments', `
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        dueDate DATETIME NOT NULL,
        points INT NOT NULL DEFAULT 100,
        status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table assignments ready');
    
    // Clean up existing assignments
    await connection.query(`
      DELETE FROM assignments WHERE courseId IN (?, ?, ?)
    `, [course1Id, course2Id, course3Id]).catch(err => {
      console.warn('Warning when cleaning assignments:', err.message);
    });
    
    // Generate assignment IDs
    const assignment1Id = uuidv4();
    const assignment2Id = uuidv4();
    const assignment3Id = uuidv4();
    const assignment4Id = uuidv4();
    
    // Current date for relative dates
    const now = new Date();
    
    // Create Math assignments
    await connection.query(`
      INSERT INTO assignments (
        id, courseId, title, description, dueDate, points, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment1Id,
      course1Id,
      'Algebra Quiz',
      'Complete the algebra quiz covering chapters 1-3',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7), // 1 week from now
      50,
      'published'
    ]);
    console.log('Assignment 1 created: Algebra Quiz');
    
    await connection.query(`
      INSERT INTO assignments (
        id, courseId, title, description, dueDate, points, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment2Id,
      course1Id,
      'Calculus Problem Set',
      'Solve the calculus problems from textbook pages 45-50',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), // 2 weeks from now
      100,
      'published'
    ]);
    console.log('Assignment 2 created: Calculus Problem Set');
    
    // Create Physics assignment
    await connection.query(`
      INSERT INTO assignments (
        id, courseId, title, description, dueDate, points, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment3Id,
      course2Id,
      'Mechanics Lab Report',
      'Write a lab report on the mechanics experiment conducted in class',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10), // 10 days from now
      75,
      'published'
    ]);
    console.log('Assignment 3 created: Mechanics Lab Report');
    
    // Create Chemistry assignment
    await connection.query(`
      INSERT INTO assignments (
        id, courseId, title, description, dueDate, points, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      assignment4Id,
      course3Id,
      'Periodic Table Quiz',
      'Complete the quiz on the periodic table of elements',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5), // 5 days from now
      40,
      'published'
    ]);
    console.log('Assignment 4 created: Periodic Table Quiz');
    
    // Create submissions table if it doesn't exist
    await createTableIfNotExists(connection, 'submissions', `
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        assignmentId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        submissionText TEXT,
        fileUrl VARCHAR(500),
        submissionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        grade INT,
        feedback TEXT,
        isLate TINYINT(1) DEFAULT 0,
        status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_submission (assignmentId, studentId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table submissions ready');
    
    // Clear existing submissions
    await connection.query(`
      DELETE FROM submissions WHERE assignmentId IN (?, ?, ?, ?)
    `, [assignment1Id, assignment2Id, assignment3Id, assignment4Id]).catch(err => {
      console.warn('Warning when cleaning submissions:', err.message);
    });
    
    // Create submissions
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Algebra Quiz submission from Student 1
    await connection.query(`
      INSERT INTO submissions (
        id, assignmentId, studentId, submissionText, fileUrl, submissionDate, grade, feedback, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      assignment1Id,
      studentId1,
      'Here is my completed algebra quiz',
      'https://example.com/submission1.pdf',
      oneWeekAgo,
      45, // 45 out of 50
      'Good work! You missed a couple of questions on factoring.',
      'graded'
    ]);
    console.log('Submission created for Assignment 1 by Student 1');
    
    // Mechanics Lab Report submission from Student 1
    await connection.query(`
      INSERT INTO submissions (
        id, assignmentId, studentId, submissionText, fileUrl, submissionDate, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      assignment3Id,
      studentId1,
      'My lab report for the mechanics experiment',
      'https://example.com/submission2.pdf',
      twoWeeksAgo,
      'submitted'
    ]);
    console.log('Submission created for Assignment 3 by Student 1');
    
    // Create grades table if it doesn't exist
    await createTableIfNotExists(connection, 'grades', `
      CREATE TABLE IF NOT EXISTS grades (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        courseId VARCHAR(36) NOT NULL,
        assignmentId VARCHAR(36),
        value DECIMAL(5,2) NOT NULL,
        type ENUM('assignment', 'midterm', 'final', 'participation') NOT NULL,
        gradedBy VARCHAR(36) NOT NULL,
        gradedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        comments TEXT,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE SET NULL,
        FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('Table grades ready');
    
    // Clear existing grades
    await connection.query(`
      DELETE FROM grades WHERE assignmentId IN (?, ?, ?, ?)
    `, [assignment1Id, assignment2Id, assignment3Id, assignment4Id]).catch(err => {
      console.warn('Warning when cleaning grades:', err.message);
    });
    
    // Create grades
    await connection.query(`
      INSERT INTO grades (
        id, studentId, courseId, assignmentId, value, type, gradedBy, gradedAt, comments
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      studentId1,
      course1Id,
      assignment1Id,
      90.00, // 90%
      'assignment',
      teacherId1,
      now,
      'Good work overall. Review factoring polynomials.'
    ]);
    console.log('Grade created for Student 1 on Assignment 1');
    
    await connection.query(`
      INSERT INTO grades (
        id, studentId, courseId, assignmentId, value, type, gradedBy, gradedAt, comments
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      studentId2,
      course1Id,
      assignment1Id,
      84.00, // 84%
      'assignment',
      teacherId1,
      now,
      'Solid understanding. Work on simplification techniques.'
    ]);
    console.log('Grade created for Student 2 on Assignment 1');
    
    return {
      assignmentIds: {
        assignment1Id,
        assignment2Id,
        assignment3Id,
        assignment4Id
      },
      submissionIds: {},
      success: true
    };
  } catch (error) {
    console.error('Error creating assignments:', error);
    throw error;
  }
}

module.exports = seedAssignments; 