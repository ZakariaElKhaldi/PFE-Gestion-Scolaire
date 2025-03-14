/**
 * Database seed script for users
 * Run with: node db/seed-users.js
 * 
 * This script inserts 4 users with different roles:
 * - Administrator
 * - Teacher
 * - Student
 * - Parent
 * 
 * It also establishes the parent-child relationship
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
  console.log('Starting user seed process...');
  
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
    const teacherId = uuidv4();
    // Set specific UUID for Student Johnson to match the one used in the application
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d';
    const parentId = uuidv4();
    
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
    
    // Insert teacher user
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      teacherId,
      'teacher@school.com',
      hashedPassword,
      'Teacher',
      'Smith',
      'teacher',
      '123-456-7891',
      'Mathematics teacher with 10 years of experience'
    ]);
    console.log('Teacher user created successfully');
    
    // Insert student user
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, studentId, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      studentId,
      'student@school.com',
      hashedPassword,
      'Student',
      'Johnson',
      'student',
      '123-456-7892',
      'ST12345',
      'High school student in science track'
    ]);
    console.log('Student user created successfully with ID: ' + studentId);
    
    // Insert parent user
    await connection.query(`
      INSERT INTO users (id, email, password, firstName, lastName, role, phoneNumber, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      parentId,
      'parent@school.com',
      hashedPassword,
      'Parent',
      'Johnson',
      'parent',
      '123-456-7893',
      'Parent of a high school student'
    ]);
    console.log('Parent user created successfully');
    
    // Create parent-child relationship
    await connection.query(`
      INSERT INTO parent_child (id, parentId, studentId, relationship, isEmergencyContact, canPickup)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      parentId,
      studentId,
      'parent',
      true,
      true
    ]);
    console.log('Parent-child relationship established');
    
    // Create a department and associate the teacher with it
    const departmentId = uuidv4();
    await connection.query(`
      INSERT INTO departments (id, name, description, headId)
      VALUES (?, ?, ?, ?)
    `, [
      departmentId,
      'Science Department',
      'Department responsible for science subjects including mathematics, physics, chemistry, and biology',
      teacherId
    ]);
    console.log('Department created and teacher assigned as head');
    
    console.log('\nUser seed completed successfully!');
    console.log('\nLogin Credentials:');
    console.log('- Admin: admin@school.com / password123');
    console.log('- Teacher: teacher@school.com / password123');
    console.log('- Student: student@school.com / password123 (ID: ' + studentId + ')');
    console.log('- Parent: parent@school.com / password123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the seed function
seedUsers(); 