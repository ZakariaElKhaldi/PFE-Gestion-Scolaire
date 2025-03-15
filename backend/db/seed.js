/**
 * Database seed script
 * Run with: node db/seed.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('Starting database seeding...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe',
    multipleStatements: true // Important for running multiple SQL statements
  });

  try {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // Generate IDs
    const adminId = uuidv4();
    const teacherId = uuidv4();
    const studentId = uuidv4();
    const parentId = uuidv4(); // Parent ID
    const departmentId = uuidv4();
    const cs101Id = uuidv4();
    const cs201Id = uuidv4();
    const cs301Id = uuidv4();
    const class1Id = uuidv4();
    const class2Id = uuidv4();
    const class3Id = uuidv4();
    const assignment1Id = uuidv4();
    const assignment2Id = uuidv4();

    // Create departments
    await connection.query(`
      INSERT INTO departments (id, name, code, description, established, status)
      VALUES (?, 'Computer Science', 'CS', 'Department of Computer Science and Engineering', '2010-01-01', 'active');
    `, [departmentId]);
    
    console.log('Department created');

    // Create users (admin, teacher, student, parent)
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, departmentId)
      VALUES 
        (?, 'admin@example.com', ?, 'Admin', 'User', 'administrator', ?),
        (?, 'teacher@example.com', ?, 'John', 'Smith', 'teacher', ?),
        (?, 'student@example.com', ?, 'Test', 'Student', 'student', ?),
        (?, 'parent@example.com', ?, 'Parent', 'Johnson', 'parent', NULL);
    `, [
      adminId, hashedPassword, departmentId, 
      teacherId, hashedPassword, departmentId, 
      studentId, hashedPassword, departmentId, 
      parentId, hashedPassword // Parent user does not belong to a department
    ]);
    
    console.log('Users created');

    // Verify parent and student exist
    const [parentExists] = await connection.query(`
      SELECT id FROM users WHERE id = ? AND role = 'parent';
    `, [parentId]);

    const [studentExists] = await connection.query(`
      SELECT id FROM users WHERE id = ? AND role = 'student';
    `, [studentId]);

    if (!parentExists.length) {
      throw new Error(`Parent with ID ${parentId} does not exist in the users table.`);
    }

    if (!studentExists.length) {
      throw new Error(`Student with ID ${studentId} does not exist in the users table.`);
    }

    // Create parent-child relationship
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES 
        (?, ?, ?, 'parent', true, true);
    `, [
      uuidv4(), // Unique ID for the relationship
      parentId, // Parent ID
      studentId // Student ID
    ]);

    console.log('Parent-child relationship created');

    // Create courses
    await connection.query(`
      INSERT INTO courses (id, name, code, description, teacherId, startDate, endDate, credits, departmentId, status)
      VALUES 
        (?, 'Introduction to Computer Science', 'CS101', 'An introduction to basic programming concepts and computer science principles.', ?, '2023-09-01', '2023-12-31', 3, ?, 'active'),
        (?, 'Data Structures', 'CS201', 'Study of data structures and algorithms for efficient data organization and manipulation.', ?, '2023-09-01', '2023-12-31', 4, ?, 'active'),
        (?, 'Algorithms', 'CS301', 'Design and analysis of algorithms for problem-solving in computing.', ?, '2023-09-01', '2023-12-31', 4, ?, 'active');
    `, [cs101Id, teacherId, departmentId, 
        cs201Id, teacherId, departmentId, 
        cs301Id, teacherId, departmentId]);
    
    console.log('Courses created');

    // Enroll student in courses
    await connection.query(`
      INSERT INTO course_enrollments (id, courseId, studentId, status)
      VALUES 
        (?, ?, ?, 'active'),
        (?, ?, ?, 'active'),
        (?, ?, ?, 'active');
    `, [uuidv4(), cs101Id, studentId, 
        uuidv4(), cs201Id, studentId, 
        uuidv4(), cs301Id, studentId]);
    
    console.log('Student enrolled in courses');

    // Create classes
    await connection.query(`
      INSERT INTO classes (id, courseId, teacherId, room, capacity)
      VALUES 
        (?, ?, ?, 'Room 101', 30),
        (?, ?, ?, 'Room 203', 25),
        (?, ?, ?, 'Room 105', 20);
    `, [class1Id, cs101Id, teacherId, 
        class2Id, cs201Id, teacherId, 
        class3Id, cs301Id, teacherId]);
    
    console.log('Classes created');

    // Create class schedules
    await connection.query(`
      INSERT INTO class_schedules (id, classId, day, startTime, endTime)
      VALUES 
        (?, ?, 'monday', '09:00:00', '10:30:00'),
        (?, ?, 'wednesday', '09:00:00', '10:30:00'),
        (?, ?, 'tuesday', '13:00:00', '14:30:00'),
        (?, ?, 'thursday', '13:00:00', '14:30:00'),
        (?, ?, 'wednesday', '10:30:00', '12:00:00'),
        (?, ?, 'friday', '10:30:00', '12:00:00');
    `, [uuidv4(), class1Id, 
        uuidv4(), class1Id, 
        uuidv4(), class2Id, 
        uuidv4(), class2Id, 
        uuidv4(), class3Id, 
        uuidv4(), class3Id]);
    
    console.log('Class schedules created');

    // Create assignments
    await connection.query(`
      INSERT INTO assignments (id, courseId, title, description, dueDate, points, status)
      VALUES 
        (?, ?, 'Introduction to Programming Assignment', 'Write a simple "Hello, World!" program in the language of your choice.', '2023-12-15 00:00:00', 100, 'published'),
        (?, ?, 'Data Types Quiz', 'Online quiz covering basic variable types and type conversion.', '2023-12-10 00:00:00', 50, 'published');
    `, [assignment1Id, cs101Id, 
        assignment2Id, cs101Id]);
    
    console.log('Assignments created');

    // Create attendance records
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    await connection.query(`
      INSERT INTO attendance (id, courseId, studentId, date, status)
      VALUES 
        (?, ?, ?, ?, 'present'),
        (?, ?, ?, ?, 'present');
    `, [uuidv4(), cs101Id, studentId, today.toISOString().split('T')[0], 
        uuidv4(), cs201Id, studentId, yesterday.toISOString().split('T')[0]]);
    
    console.log('Attendance records created');

    // Create grades
    await connection.query(`
      INSERT INTO grades (id, studentId, courseId, assignmentId, value, type, gradedBy, comments)
      VALUES 
        (?, ?, ?, ?, 85, 'assignment', ?, 'Good work on the introduction!'),
        (?, ?, ?, NULL, 92, 'midterm', ?, 'Excellent understanding of core concepts.');
    `, [uuidv4(), studentId, cs101Id, assignment1Id, teacherId, 
        uuidv4(), studentId, cs101Id, teacherId]);
    
    console.log('Grades created');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the seed function
seed().catch(console.error);