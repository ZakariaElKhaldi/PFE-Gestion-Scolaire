/**
 * Seed script for users
 */
const { uuidv4, hashPassword, deleteExistingRecordByEmail } = require('./utils');

/**
 * Seed users
 * @param {object} connection - MySQL connection
 * @returns {object} - User IDs for use in other seed modules
 */
async function seedUsers(connection) {
  console.log('Creating users...');
  
  // Default password for all users
  const hashedPassword = await hashPassword('password123');
  
  // Generate UUIDs for each user
  const adminId = uuidv4();
  const teacherId1 = uuidv4();
  const teacherId2 = uuidv4();
  // Set specific UUID for Student Johnson to match the one used in the application
  const studentId1 = 'f4b969e2-324a-4333-9624-d016a54ea06d';
  const studentId2 = uuidv4();
  const studentId3 = uuidv4();
  const parentId1 = uuidv4();
  const parentId2 = uuidv4();
  
  try {
    // Delete existing records by email to prevent duplicates
    await deleteExistingRecordByEmail(connection, 'admin@school.com');
    await deleteExistingRecordByEmail(connection, 'teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'science.teacher@school.com');
    await deleteExistingRecordByEmail(connection, 'student@school.com');
    await deleteExistingRecordByEmail(connection, 'mike.student@school.com');
    await deleteExistingRecordByEmail(connection, 'emma.student@school.com');
    await deleteExistingRecordByEmail(connection, 'parent@school.com');
    await deleteExistingRecordByEmail(connection, 'jane.parent@school.com');
    
    // Insert admin user
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminId,
      'admin@school.com',
      hashedPassword,
      'Admin',
      'User',
      'administrator',
      '123-456-7890',
      'System administrator for the school management system'
    ]);
    console.log('Admin user created successfully');
    
    // Insert teacher users
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacherId1,
      'teacher@school.com',
      hashedPassword,
      'Teacher',
      'Smith',
      'teacher',
      '123-456-7891',
      'Mathematics teacher with 10 years of experience'
    ]);
    console.log('Teacher 1 created successfully');
    
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacherId2,
      'science.teacher@school.com',
      hashedPassword,
      'Sarah',
      'Johnson',
      'teacher',
      '123-456-7892',
      'Science teacher specializing in physics and chemistry'
    ]);
    console.log('Teacher 2 created successfully');
    
    // Insert student users
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, studentId, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId1,
      'student@school.com',
      hashedPassword,
      'Student',
      'Johnson',
      'student',
      '123-456-7893',
      studentId1, // Use the UUID as studentId instead of 'ST12345'
      'High school student in science track'
    ]);
    console.log('Student 1 created successfully with ID: ' + studentId1);
    
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, studentId, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId2,
      'mike.student@school.com',
      hashedPassword,
      'Mike',
      'Williams',
      'student',
      '123-456-7894',
      studentId2, // Use the UUID as studentId
      'High school student in arts track'
    ]);
    console.log('Student 2 created successfully with ID: ' + studentId2);
    
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, studentId, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId3,
      'emma.student@school.com',
      hashedPassword,
      'Emma',
      'Davis',
      'student',
      '123-456-7895',
      studentId3, // Use the UUID as studentId
      'High school student interested in computer science'
    ]);
    console.log('Student 3 created successfully with ID: ' + studentId3);
    
    // Insert parent users
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parentId1,
      'parent@school.com',
      hashedPassword,
      'Parent',
      'Johnson',
      'parent',
      '123-456-7896',
      'Parent of a high school student'
    ]);
    console.log('Parent 1 created successfully');
    
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parentId2,
      'jane.parent@school.com',
      hashedPassword,
      'Jane',
      'Williams',
      'parent',
      '123-456-7897',
      'Parent of a high school student in arts track'
    ]);
    console.log('Parent 2 created successfully');
    
    // Try to create student records - might fail if table doesn't exist
    try {
      await connection.query(`
        INSERT INTO students (userId, enrollmentDate, status)
        VALUES (?, ?, ?)
      `, [
        studentId1,
        new Date(),
        'active'
      ]);
      
      await connection.query(`
        INSERT INTO students (userId, enrollmentDate, status)
        VALUES (?, ?, ?)
      `, [
        studentId2,
        new Date(),
        'active'
      ]);
      
      await connection.query(`
        INSERT INTO students (userId, enrollmentDate, status)
        VALUES (?, ?, ?)
      `, [
        studentId3,
        new Date(),
        'active'
      ]);
    } catch (err) {
      console.log('Note: students table entries might already exist or table structure differs:', err.message);
    }
    
    return {
      adminId,
      teacherId1,
      teacherId2,
      studentId1,
      studentId2,
      studentId3,
      parentId1,
      parentId2
    };
  } catch (error) {
    console.error('Error creating users:', error);
    throw error;
  }
}

module.exports = seedUsers; 