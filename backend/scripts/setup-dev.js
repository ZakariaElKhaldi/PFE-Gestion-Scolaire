/**
 * Development Setup Script
 * 
 * This script helps developers set up their development environment.
 * It will:
 * 1. Reset the database (optional)
 * 2. Run migrations
 * 3. Create sample data
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get confirmation from user
function askQuestion(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

async function setupDevelopmentEnvironment() {
  console.log('\x1b[36m%s\x1b[0m', '🔧 Setting up development environment...');
  
  // Ask if user wants to reset database
  const resetAnswer = await askQuestion('\x1b[1m Do you want to reset the database? This will delete all existing data! (yes/no) \x1b[0m');
  
  if (resetAnswer.toLowerCase() === 'yes') {
    try {
      console.log('Resetting database...');
      await execPromise('node scripts/reset-db.js');
      console.log('Database reset completed');
    } catch (error) {
      console.error('Failed to reset database:', error);
      rl.close();
      return;
    }
  } else {
    console.log('Skipping database reset');
    
    // Run migrations instead
    try {
      console.log('Running migrations...');
      await execPromise('npm run migrations');
      console.log('Migrations completed');
    } catch (error) {
      console.error('Failed to run migrations:', error);
      rl.close();
      return;
    }
  }
  
  // Ask if user wants to create sample data
  const sampleDataAnswer = await askQuestion('\x1b[1m Do you want to create sample data? (yes/no) \x1b[0m');
  
  if (sampleDataAnswer.toLowerCase() === 'yes') {
    try {
      console.log('Creating sample data...');
      await createSampleData();
      console.log('\x1b[32m%s\x1b[0m', '✅ Sample data created successfully!');
    } catch (error) {
      console.error('Failed to create sample data:', error);
      rl.close();
      return;
    }
  } else {
    console.log('Skipping sample data creation');
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✅ Development environment setup completed successfully!');
  console.log('\x1b[36m%s\x1b[0m', 'You can now start the server with: npm run dev');
  
  rl.close();
}

async function createSampleData() {
  const pool = await createPool();
  
  try {
    console.log('Connecting to database...');
    
    // Hash password for sample users
    const password = await bcrypt.hash('password123', 10);
    
    // Create sample users
    console.log('Creating sample users...');
    
    const users = [
      {
        id: uuidv4(),
        email: 'admin@school.com',
        password,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '1234567890',
        role: 'admin'
      },
      {
        id: uuidv4(),
        email: 'teacher@school.com',
        password,
        firstName: 'Teacher',
        lastName: 'Smith',
        phoneNumber: '1234567891',
        role: 'teacher'
      },
      {
        id: uuidv4(),
        email: 'student@school.com',
        password,
        firstName: 'Student',
        lastName: 'Johnson',
        phoneNumber: '1234567892',
        role: 'student'
      },
      {
        id: uuidv4(),
        email: 'parent@school.com',
        password,
        firstName: 'Parent',
        lastName: 'Brown',
        phoneNumber: '1234567893',
        role: 'parent'
      }
    ];
    
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (id, email, password, firstName, lastName, phoneNumber, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.password, user.firstName, user.lastName, user.phoneNumber, user.role]
      );
    }
    
    // Create sample courses
    console.log('Creating sample courses...');
    
    const teacherId = users[1].id; // Teacher Smith
    
    const courses = [
      {
        id: uuidv4(),
        title: 'Introduction to Computer Science',
        description: 'An introductory course covering the basics of computer science and programming.',
        code: 'CS101',
        credits: 3,
        teacherId
      },
      {
        id: uuidv4(),
        title: 'Advanced Mathematics',
        description: 'A comprehensive study of advanced mathematical concepts and their applications.',
        code: 'MATH201',
        credits: 4,
        teacherId
      },
      {
        id: uuidv4(),
        title: 'English Literature',
        description: 'Exploring classic and contemporary literature from around the world.',
        code: 'ENG101',
        credits: 3,
        teacherId
      }
    ];
    
    for (const course of courses) {
      await pool.query(
        'INSERT INTO courses (id, title, description, code, credits, teacherId) VALUES (?, ?, ?, ?, ?, ?)',
        [course.id, course.title, course.description, course.code, course.credits, course.teacherId]
      );
    }
    
    // Create course enrollments
    console.log('Creating course enrollments...');
    
    const studentId = users[2].id; // Student Johnson
    
    for (const course of courses) {
      await pool.query(
        'INSERT INTO course_enrollments (id, studentId, courseId, status) VALUES (?, ?, ?, ?)',
        [uuidv4(), studentId, course.id, 'active']
      );
    }
    
    // Create parent-child relationship
    console.log('Creating parent-child relationship...');
    
    const parentId = users[3].id; // Parent Brown
    
    await pool.query(
      'INSERT INTO parent_relationships (id, parentId, studentId, relationshipType, status) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), parentId, studentId, 'parent', 'verified']
    );
    
    console.log('Sample data creation complete!');
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDevelopmentEnvironment(); 