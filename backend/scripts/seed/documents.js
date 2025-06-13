/**
 * Seed script for documents
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed documents
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @returns {object} - Document IDs for reference
 */
async function seedDocuments(connection, userData) {
  console.log('Creating documents...');
  
  // Extract user IDs
  const { teacherId1, teacherId2, studentId1, studentId2, adminId } = userData;
  
  try {
    // Create documents table if it doesn't exist
    await createTableIfNotExists(connection, 'documents', `
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(36) PRIMARY KEY,
        userId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        url VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        uploadedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing documents
    await connection.query(`DELETE FROM documents WHERE userId IN (?, ?, ?, ?, ?)`, 
      [teacherId1, teacherId2, studentId1, studentId2, adminId]).catch(err => {
      console.warn('Warning when cleaning documents:', err.message);
    });
    
    // Generate document IDs
    const docId1 = uuidv4();
    const docId2 = uuidv4();
    const docId3 = uuidv4();
    const docId4 = uuidv4();
    const docId5 = uuidv4();
    
    // Insert teacher documents
    await connection.query(`
      INSERT INTO documents (
        id, userId, title, description, type, url, size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId1,
      teacherId1,
      'Course Guidelines',
      'Guidelines and policies for mathematics courses',
      'pdf',
      '/uploads/documents/course_guidelines.pdf',
      1024 * 50, // 50KB
      'approved'
    ]);
    console.log('Teacher document 1 created');
    
    await connection.query(`
      INSERT INTO documents (
        id, userId, title, description, type, url, size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId2,
      teacherId2,
      'Lab Safety Rules',
      'Important safety rules for science laboratories',
      'pdf',
      '/uploads/documents/lab_safety_rules.pdf',
      1024 * 75, // 75KB
      'approved'
    ]);
    console.log('Teacher document 2 created');
    
    // Insert student document (assignment submission)
    await connection.query(`
      INSERT INTO documents (
        id, userId, title, description, type, url, size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId3,
      studentId1,
      'Mathematics Assignment 1',
      'Submission for the first mathematics assignment',
      'docx',
      '/uploads/documents/math_assignment1_student1.docx',
      1024 * 30, // 30KB
      'approved'
    ]);
    console.log('Student document created');
    
    // Insert admin document (school policy)
    await connection.query(`
      INSERT INTO documents (
        id, userId, title, description, type, url, size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId4,
      adminId,
      'School Academic Policy',
      'Official academic policy for the school year',
      'pdf',
      '/uploads/documents/academic_policy.pdf',
      1024 * 120, // 120KB
      'approved'
    ]);
    console.log('Admin document created');
    
    // Insert pending document
    await connection.query(`
      INSERT INTO documents (
        id, userId, title, description, type, url, size, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId5,
      studentId2,
      'Updated Medical Certificate',
      'Medical certificate for absence from classes',
      'pdf',
      '/uploads/documents/medical_certificate.pdf',
      1024 * 15, // 15KB
      'pending'
    ]);
    console.log('Pending document created');
    
    return {
      success: true,
      documentIds: {
        docId1,
        docId2,
        docId3,
        docId4,
        docId5
      },
      message: 'Documents created successfully'
    };
  } catch (error) {
    console.error('Error creating documents:', error);
    throw error;
  }
}

module.exports = seedDocuments; 