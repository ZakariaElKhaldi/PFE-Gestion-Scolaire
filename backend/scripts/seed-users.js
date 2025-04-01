/**
 * Database seed script for users
 * Run with: node scripts/seed-users.js
 * 
 * This script inserts users with different roles:
 * - Administrator
 * - Teacher
 * - Student
 * - Parent
 * 
 * It also creates related data:
 * - Parent-child relationships
 * - Departments
 * - Courses
 * - Class schedules
 * - Assignments
 * - Attendance records
 * - Course materials
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedUsers() {
  console.log('Starting comprehensive seed process...');
  
  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe',
    multipleStatements: true
  });

  try {
    // Hash password - all users will have password "password123"
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
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
      'ST12345',
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
      'ST12346',
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
      'ST12347',
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
    
    // Create parent-child relationships
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId1,
      studentId1,
      'parent',
      true,
      true
    ]);
    console.log('Parent-child relationship 1 established');
    
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId2,
      studentId2,
      'parent',
      true,
      true
    ]);
    console.log('Parent-child relationship 2 established');
    
    // Create parent relationships in the newer table
    await connection.query(`
      INSERT INTO parent_relationships (
        id, 
        parent_id, 
        student_id, 
        relationship_type, 
        description, 
        status, 
        verification_token, 
        token_expiry
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId1,
      studentId1,
      'parent',
      'Father',
      'verified',
      uuidv4(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    ]);
    console.log('Parent relationship 1 created in parent_relationships table');
    
    await connection.query(`
      INSERT INTO parent_relationships (
        id, 
        parent_id, 
        student_id, 
        relationship_type, 
        description, 
        status, 
        verification_token, 
        token_expiry
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId2,
      studentId2,
      'parent',
      'Mother',
      'verified',
      uuidv4(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    ]);
    console.log('Parent relationship 2 created in parent_relationships table');
    
    // Create departments and associate teachers with them
    const scienceDeptId = uuidv4();
    await connection.query(`
      INSERT INTO departments (id, name, description, headId)
      VALUES (?, ?, ?, ?)
    `, [
      scienceDeptId,
      'Science Department',
      'Department responsible for science subjects including physics, chemistry, and biology',
      teacherId2
    ]);
    console.log('Science Department created with teacher 2 as head');
    
    const mathDeptId = uuidv4();
    await connection.query(`
      INSERT INTO departments (id, name, description, headId)
      VALUES (?, ?, ?, ?)
    `, [
      mathDeptId,
      'Mathematics Department',
      'Department responsible for mathematics subjects including algebra, geometry, and calculus',
      teacherId1
    ]);
    console.log('Mathematics Department created with teacher 1 as head');
    
    // Insert student records
    const now = new Date();
    await connection.query(`
      INSERT INTO students (userId, enrollmentDate, status)
      VALUES (?, ?, ?)
    `, [
      studentId1,
      now,
      'active'
    ]);
    console.log('Student 1 record created in students table');
    
    await connection.query(`
      INSERT INTO students (userId, enrollmentDate, status)
      VALUES (?, ?, ?)
    `, [
      studentId2,
      now,
      'active'
    ]);
    console.log('Student 2 record created in students table');
    
    await connection.query(`
      INSERT INTO students (userId, enrollmentDate, status)
      VALUES (?, ?, ?)
    `, [
      studentId3,
      now,
      'active'
    ]);
    console.log('Student 3 record created in students table');
    
    // Create courses
    const course1Id = uuidv4();
    const course2Id = uuidv4();
    const course3Id = uuidv4();
    
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
    
    // Enroll students in courses
    await connection.query(`
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
    ]);
    console.log('Student 1 enrolled in Advanced Mathematics');
    
    await connection.query(`
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
    ]);
    console.log('Student 1 enrolled in Physics 101');
    
    await connection.query(`
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
    ]);
    console.log('Student 2 enrolled in Advanced Mathematics');
    
    await connection.query(`
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
    ]);
    console.log('Student 3 enrolled in Physics 101');
    
    await connection.query(`
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
    ]);
    console.log('Student 3 enrolled in Chemistry Basics');
    
    // Create class sessions
    const class1Id = uuidv4();
    const class2Id = uuidv4();
    const class3Id = uuidv4();
    
    // Create classes table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        roomNumber VARCHAR(20),
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      INSERT INTO classes (
        id, courseId, name, roomNumber, startTime, endTime, dayOfWeek
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      class1Id,
      course1Id,
      'Math 101 - Monday Session',
      'Room 101',
      '09:00:00',
      '10:30:00',
      'Monday'
    ]);
    console.log('Class session 1 created for Advanced Mathematics');
    
    await connection.query(`
      INSERT INTO classes (
        id, courseId, name, roomNumber, startTime, endTime, dayOfWeek
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      class2Id,
      course2Id,
      'Physics 101 - Tuesday Session',
      'Room 203',
      '13:00:00',
      '14:30:00',
      'Tuesday'
    ]);
    console.log('Class session 2 created for Physics 101');
    
    await connection.query(`
      INSERT INTO classes (
        id, courseId, name, roomNumber, startTime, endTime, dayOfWeek
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      class3Id,
      course3Id,
      'Chemistry 101 - Wednesday Session',
      'Lab 2',
      '10:00:00',
      '12:00:00',
      'Wednesday'
    ]);
    console.log('Class session 3 created for Chemistry Basics');
    
    // Create class schedules
    await connection.query(`
      CREATE TABLE IF NOT EXISTS class_schedules (
        id VARCHAR(36) PRIMARY KEY,
        classId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
        notes TEXT,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE
      )
    `);
    
    // Generate schedules for next 4 weeks
    const oneDay = 24 * 60 * 60 * 1000;
    let currentDate = new Date();
    
    // Find next Monday, Tuesday, and Wednesday
    let nextMonday = new Date(currentDate);
    while (nextMonday.getDay() !== 1) { // 1 is Monday
      nextMonday = new Date(nextMonday.getTime() + oneDay);
    }
    
    let nextTuesday = new Date(currentDate);
    while (nextTuesday.getDay() !== 2) { // 2 is Tuesday
      nextTuesday = new Date(nextTuesday.getTime() + oneDay);
    }
    
    let nextWednesday = new Date(currentDate);
    while (nextWednesday.getDay() !== 3) { // 3 is Wednesday
      nextWednesday = new Date(nextWednesday.getTime() + oneDay);
    }
    
    // Generate 4 Mondays for Math class
    for (let i = 0; i < 4; i++) {
      const scheduleDate = new Date(nextMonday);
      scheduleDate.setDate(scheduleDate.getDate() + (i * 7));
      
      await connection.query(`
        INSERT INTO class_schedules (
          id, classId, date, startTime, endTime, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        class1Id,
        scheduleDate.toISOString().split('T')[0],
        '09:00:00',
        '10:30:00',
        'scheduled',
        i === 0 ? 'First session of the month. Introduction to new topics.' : ''
      ]);
    }
    console.log('Created 4 weekly schedule entries for Math class');
    
    // Generate 4 Tuesdays for Physics class
    for (let i = 0; i < 4; i++) {
      const scheduleDate = new Date(nextTuesday);
      scheduleDate.setDate(scheduleDate.getDate() + (i * 7));
      
      await connection.query(`
        INSERT INTO class_schedules (
          id, classId, date, startTime, endTime, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        class2Id,
        scheduleDate.toISOString().split('T')[0],
        '13:00:00',
        '14:30:00',
        'scheduled',
        i === 1 ? 'Quiz during this session' : ''
      ]);
    }
    console.log('Created 4 weekly schedule entries for Physics class');
    
    // Generate 4 Wednesdays for Chemistry class
    for (let i = 0; i < 4; i++) {
      const scheduleDate = new Date(nextWednesday);
      scheduleDate.setDate(scheduleDate.getDate() + (i * 7));
      
      await connection.query(`
        INSERT INTO class_schedules (
          id, classId, date, startTime, endTime, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        class3Id,
        scheduleDate.toISOString().split('T')[0],
        '10:00:00',
        '12:00:00',
        'scheduled',
        i === 2 ? 'Lab session - bring safety goggles' : ''
      ]);
    }
    console.log('Created 4 weekly schedule entries for Chemistry class');
    
    // Create assignments
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        dueDate DATETIME NOT NULL,
        points INT NOT NULL DEFAULT 100,
        status ENUM('draft', 'published', 'closed') DEFAULT 'published',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    
    // Math assignments
    const assignment1Id = uuidv4();
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
    
    const assignment2Id = uuidv4();
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
    
    // Physics assignments
    const assignment3Id = uuidv4();
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
    
    // Chemistry assignments
    const assignment4Id = uuidv4();
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
    
    // Create submissions table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(36) PRIMARY KEY,
        assignmentId VARCHAR(36) NOT NULL,
        studentId VARCHAR(36) NOT NULL,
        submissionUrl VARCHAR(255),
        comment TEXT,
        submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        grade FLOAT,
        feedback TEXT,
        gradedBy VARCHAR(36),
        gradedAt TIMESTAMP,
        status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    
    // Create a few submissions
    await connection.query(`
      INSERT INTO submissions (
        id, assignmentId, studentId, submissionUrl, comment, submittedAt, grade, feedback, gradedBy, gradedAt, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      assignment1Id,
      studentId1,
      'https://example.com/submission1.pdf',
      'Here is my completed algebra quiz',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2), // 2 days ago
      45, // 45 out of 50
      'Good work! You missed a couple of questions on factoring.',
      teacherId1,
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), // 1 day ago
      'graded'
    ]);
    console.log('Submission created for Assignment 1 by Student 1');
    
    await connection.query(`
      INSERT INTO submissions (
        id, assignmentId, studentId, submissionUrl, comment, submittedAt, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      assignment3Id,
      studentId1,
      'https://example.com/submission2.pdf',
      'My lab report for the mechanics experiment',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), // 1 day ago
      'submitted'
    ]);
    console.log('Submission created for Assignment 3 by Student 1');
    
    // Create attendance records
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        classId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (studentId, classId, date)
      )
    `);
    
    // Generate some past attendance records (for the past 3 weeks)
    for (let i = 1; i <= 3; i++) {
      const pastMonday = new Date(nextMonday);
      pastMonday.setDate(pastMonday.getDate() - (7 * i));
      
      // Math class attendance
      await connection.query(`
        INSERT INTO attendance (
          id, studentId, classId, date, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId1,
        class1Id,
        pastMonday.toISOString().split('T')[0],
        i === 2 ? 'absent' : 'present',
        i === 2 ? 'Student was sick' : ''
      ]);
      
      if (i < 3) { // Only for the last 2 weeks for student 2
        await connection.query(`
          INSERT INTO attendance (
            id, studentId, classId, date, status, notes
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(),
          studentId2,
          class1Id,
          pastMonday.toISOString().split('T')[0],
          'present',
          ''
        ]);
      }
      
      // Physics class attendance
      const pastTuesday = new Date(nextTuesday);
      pastTuesday.setDate(pastTuesday.getDate() - (7 * i));
      
      await connection.query(`
        INSERT INTO attendance (
          id, studentId, classId, date, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId1,
        class2Id,
        pastTuesday.toISOString().split('T')[0],
        i === 1 ? 'late' : 'present',
        i === 1 ? 'Student arrived 10 minutes late' : ''
      ]);
      
      await connection.query(`
        INSERT INTO attendance (
          id, studentId, classId, date, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId3,
        class2Id,
        pastTuesday.toISOString().split('T')[0],
        'present',
        ''
      ]);
      
      // Chemistry class attendance
      const pastWednesday = new Date(nextWednesday);
      pastWednesday.setDate(pastWednesday.getDate() - (7 * i));
      
      await connection.query(`
        INSERT INTO attendance (
          id, studentId, classId, date, status, notes
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        studentId3,
        class3Id,
        pastWednesday.toISOString().split('T')[0],
        i === 3 ? 'excused' : 'present',
        i === 3 ? 'Family emergency' : ''
      ]);
    }
    console.log('Created attendance records for the past 3 weeks');
    
    // Create materials
    await connection.query(`
      CREATE TABLE IF NOT EXISTS materials (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        type ENUM('document', 'video', 'link', 'other') NOT NULL,
        url VARCHAR(255) NOT NULL,
        uploadedBy VARCHAR(36) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Add materials for the courses
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      course1Id,
      'Algebra Basics PDF',
      'Introduction to algebra concepts',
      'document',
      'https://example.com/materials/algebra-basics.pdf',
      teacherId1
    ]);
    console.log('Material 1 created for Mathematics course');
    
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      course1Id,
      'Calculus Video Tutorial',
      'Video explaining calculus fundamentals',
      'video',
      'https://example.com/videos/calculus-tutorial.mp4',
      teacherId1
    ]);
    console.log('Material 2 created for Mathematics course');
    
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      course2Id,
      'Physics Formulas Cheat Sheet',
      'Quick reference for important physics formulas',
      'document',
      'https://example.com/materials/physics-formulas.pdf',
      teacherId2
    ]);
    console.log('Material 3 created for Physics course');
    
    await connection.query(`
      INSERT INTO materials (
        id, courseId, title, description, type, url, uploadedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      course3Id,
      'Periodic Table Interactive',
      'Interactive periodic table of elements',
      'link',
      'https://example.com/interactive/periodic-table',
      teacherId2
    ]);
    console.log('Material 4 created for Chemistry course');
    
    // Create grading table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS grades (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        courseId VARCHAR(36) NOT NULL,
        assignmentId VARCHAR(36) NOT NULL,
        score FLOAT NOT NULL,
        maxScore FLOAT NOT NULL,
        comments TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE
      )
    `);
    
    // Add grades
    await connection.query(`
      INSERT INTO grades (
        id, studentId, courseId, assignmentId, score, maxScore, comments
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      studentId1,
      course1Id,
      assignment1Id,
      45,
      50,
      'Good work overall. Review factoring polynomials.'
    ]);
    console.log('Grade created for Student 1 on Assignment 1');
    
    await connection.query(`
      INSERT INTO grades (
        id, studentId, courseId, assignmentId, score, maxScore, comments
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      studentId2,
      course1Id,
      assignment1Id,
      42,
      50,
      'Solid understanding. Work on simplification techniques.'
    ]);
    console.log('Grade created for Student 2 on Assignment 1');
    
    console.log('\nComprehensive seed completed successfully!');
    console.log('\nLogin Credentials:');
    console.log('- Admin: admin@school.com / password123');
    console.log('- Teacher 1: teacher@school.com / password123');
    console.log('- Teacher 2: science.teacher@school.com / password123');
    console.log('- Student 1: student@school.com / password123 (ID: ' + studentId1 + ')');
    console.log('- Student 2: mike.student@school.com / password123');
    console.log('- Student 3: emma.student@school.com / password123');
    console.log('- Parent 1: parent@school.com / password123');
    console.log('- Parent 2: jane.parent@school.com / password123');
    
    console.log('\nCreated Data Summary:');
    console.log('- 3 Courses: Mathematics, Physics, Chemistry');
    console.log('- 3 Class schedules with weekly sessions for 4 weeks');
    console.log('- 4 Assignments across different courses');
    console.log('- 2 Student submissions');
    console.log('- Attendance records for past 3 weeks');
    console.log('- 4 Course materials');
    console.log('- 2 Student grades');
    
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the seed function
seedUsers(); 