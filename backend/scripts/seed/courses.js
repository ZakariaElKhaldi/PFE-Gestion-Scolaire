/**
 * Seed script for courses and enrollments
 */
const { uuidv4, createTableIfNotExists } = require('./utils');

/**
 * Seed courses and student enrollments
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from the users seed
 * @returns {object} - Course IDs for use in other seed modules
 */
async function seedCourses(connection, userData) {
  console.log('Creating courses and enrollments...');
  
  // Extract user IDs
  const { teacherId1, teacherId2, studentId1, studentId2, studentId3 } = userData;
  
  // Course IDs
  const course1Id = uuidv4();
  const course2Id = uuidv4();
  const course3Id = uuidv4();
  
  try {
    // Clean up existing courses if they exist
    try {
      await connection.query('DELETE FROM courses WHERE code IN (?, ?, ?)', [
        'MATH101',
        'PHYS101',
        'CHEM101'
      ]);
    } catch (error) {
      console.warn('Warning when cleaning up courses:', error.message);
    }
    
    const now = new Date();
    
    // Create courses
    await connection.query(`
      INSERT INTO courses (
        id, name, code, description, credits, startDate, endDate, status, teacherId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      course1Id,
      'Advanced Mathematics',
      'MATH101',
      'Introduction to advanced mathematical concepts including calculus and linear algebra',
      4,
      new Date(now.getFullYear(), now.getMonth() - 1, 1), // Last month
      new Date(now.getFullYear(), now.getMonth() + 5, 1), // 6 months from start
      'active',
      teacherId1
    ]);
    console.log('Course 1 created: Advanced Mathematics');
    
    await connection.query(`
      INSERT INTO courses (
        id, name, code, description, credits, startDate, endDate, status, teacherId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      course2Id,
      'Physics 101',
      'PHYS101',
      'Introduction to physics covering mechanics, thermodynamics, and waves',
      3,
      new Date(now.getFullYear(), now.getMonth() - 1, 1), // Last month
      new Date(now.getFullYear(), now.getMonth() + 5, 1), // 6 months from start
      'active',
      teacherId2
    ]);
    console.log('Course 2 created: Physics 101');
    
    await connection.query(`
      INSERT INTO courses (
        id, name, code, description, credits, startDate, endDate, status, teacherId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      course3Id,
      'Chemistry Basics',
      'CHEM101',
      'Introduction to basic chemistry principles and laboratory techniques',
      3,
      new Date(now.getFullYear(), now.getMonth() - 1, 1), // Last month
      new Date(now.getFullYear(), now.getMonth() + 5, 1), // 6 months from start
      'active',
      teacherId2
    ]);
    console.log('Course 3 created: Chemistry Basics');
    
    // Ensure course_enrollments table exists
    try {
      // Clean up existing enrollments
      await connection.query(`
        DELETE FROM course_enrollments 
        WHERE studentId IN (?, ?, ?) AND courseId IN (?, ?, ?)
      `, [
        studentId1, studentId2, studentId3, 
        course1Id, course2Id, course3Id
      ]);
    } catch (error) {
      console.warn('Warning when cleaning enrollments:', error.message);
      
      try {
        // Create course_enrollments table if it doesn't exist
        await createTableIfNotExists(connection, 'course_enrollments', `
          CREATE TABLE IF NOT EXISTS course_enrollments (
            id VARCHAR(36) PRIMARY KEY,
            studentId VARCHAR(36) NOT NULL,
            courseId VARCHAR(36) NOT NULL,
            enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status ENUM('active', 'completed', 'dropped', 'pending') DEFAULT 'active',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
            UNIQUE KEY unique_enrollment (studentId, courseId)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } catch (tableError) {
        console.warn('Could not create course_enrollments table:', tableError.message);
      }
    }
    
    // Enroll students in courses
    const enrollmentPromises = [
      // Student 1 enrollments
      connection.query(`
        INSERT INTO course_enrollments (
          id, studentId, courseId, enrollmentDate, status
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId1,
        course1Id,
        now,
        'active'
      ]).then(() => console.log('Student 1 enrolled in Advanced Mathematics')),
      
      connection.query(`
        INSERT INTO course_enrollments (
          id, studentId, courseId, enrollmentDate, status
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId1,
        course2Id,
        now,
        'active'
      ]).then(() => console.log('Student 1 enrolled in Physics 101')),
      
      // Student 2 enrollment
      connection.query(`
        INSERT INTO course_enrollments (
          id, studentId, courseId, enrollmentDate, status
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId2,
        course1Id,
        now,
        'active'
      ]).then(() => console.log('Student 2 enrolled in Advanced Mathematics')),
      
      // Student 3 enrollments
      connection.query(`
        INSERT INTO course_enrollments (
          id, studentId, courseId, enrollmentDate, status
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId3,
        course2Id,
        now,
        'active'
      ]).then(() => console.log('Student 3 enrolled in Physics 101')),
      
      connection.query(`
        INSERT INTO course_enrollments (
          id, studentId, courseId, enrollmentDate, status
        )
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId3,
        course3Id,
        now,
        'active'
      ]).then(() => console.log('Student 3 enrolled in Chemistry Basics'))
    ];
    
    // Handle enrollment errors individually
    for (const enrollPromise of enrollmentPromises) {
      try {
        await enrollPromise;
      } catch (error) {
        console.warn('Warning during enrollment:', error.message);
      }
    }
    
    return {
      course1Id,
      course2Id,
      course3Id,
      courses: [
        {
          id: course1Id,
          name: 'Advanced Mathematics',
          code: 'MATH101',
          teacherId: teacherId1
        },
        {
          id: course2Id,
          name: 'Physics 101',
          code: 'PHYS101',
          teacherId: teacherId2
        },
        {
          id: course3Id,
          name: 'Chemistry Basics',
          code: 'CHEM101',
          teacherId: teacherId2
        }
      ],
      enrollments: [
        { studentId: studentId1, courseId: course1Id },
        { studentId: studentId1, courseId: course2Id },
        { studentId: studentId2, courseId: course1Id },
        { studentId: studentId3, courseId: course2Id },
        { studentId: studentId3, courseId: course3Id }
      ]
    };
  } catch (error) {
    console.error('Error creating courses:', error);
    throw error;
  }
}

module.exports = seedCourses; 