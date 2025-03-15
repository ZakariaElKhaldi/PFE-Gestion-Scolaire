/**
 * Comprehensive Database Setup Script
 * 
 * This script performs a complete setup of the database with comprehensive test data:
 * 1. Resets the database using schema.sql
 * 2. Creates default users (admin, teachers, students, parents)
 * 3. Creates departments and courses
 * 4. Creates classes and schedules
 * 5. Creates assignments and submissions
 * 6. Creates documents and materials
 * 7. Creates attendance records
 * 8. Creates feedback entries
 * 9. Creates payment records
 * 10. Creates certificates
 * 
 * Run with: node db/full-setup.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { exec } = require('child_process');
const util = require('util');
const { v4: uuidv4 } = require('uuid');

// Convert exec to promise
const execPromise = util.promisify(exec);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Feedback table creation SQL
const createFeedbackTableSQL = `
CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'reviewed') DEFAULT 'pending',
  teacherResponse TEXT,
  teacherResponseDate TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
);
`;

// Documents table creation SQL
const createDocumentsTableSQL = `
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ownerId VARCHAR(36) NOT NULL,
  type ENUM('assignment', 'material', 'personal', 'administrative') NOT NULL,
  visibility ENUM('private', 'public', 'restricted') DEFAULT 'private',
  description TEXT,
  filePath VARCHAR(255) NOT NULL,
  fileSize BIGINT,
  mimeType VARCHAR(100),
  tags VARCHAR(255),
  courseId VARCHAR(36),
  assignmentId VARCHAR(36),
  uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastModified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
);
`;

async function fullDatabaseSetup() {
  console.log('┌─────────────────────────────────────────┐');
  console.log('│  SCHOOL MANAGEMENT SYSTEM - FULL SETUP  │');
  console.log('└─────────────────────────────────────────┘');
  console.log('Starting comprehensive database setup process...');
  
  // Database connection config
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pfe',
    multipleStatements: true
  };
  
  try {
    // Step 1: Reset the database with schema.sql
    console.log('\n=== STEP 1: Resetting database schema ===');
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema file not found at: ' + schemaPath);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Create connection without specifying database to be able to drop it
    let connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });
    
    // Drop and recreate database
    await connection.query(`DROP DATABASE IF EXISTS ${dbConfig.database};`);
    await connection.query(`CREATE DATABASE ${dbConfig.database};`);
    await connection.query(`USE ${dbConfig.database};`);
    
    // Run the schema SQL
    await connection.query(schema);
    console.log('✓ Database schema reset successfully');
    await connection.end();
    
    // Step 2: Run the seed-users.js script for basic users
    console.log('\n=== STEP 2: Creating default users ===');
    await execPromise('node db/seed-users.js');
    console.log('✓ Default users created successfully');
    
    // Step 3: Run the seed-test-data.js script for comprehensive test data
    console.log('\n=== STEP 3: Creating comprehensive test data ===');
    await execPromise('node db/seed-test-data.js');
    console.log('✓ Comprehensive test data created successfully');
    
    // Step 4: Set up departments
    console.log('\n=== STEP 4: Setting up departments ===');
    await execPromise('node db/setup-departments.js');
    console.log('✓ Departments created successfully');
    
    // Step 5: Ensure tables exist and check table structures
    console.log('\n=== STEP 5: Ensuring all tables exist ===');
    const dbConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true
    });
    
    // Create feedback table if it doesn't exist
    await dbConnection.query(createFeedbackTableSQL);
    console.log('✓ Feedback table created/verified');
    
    // Check documents table structure
    const [documentsTableInfo] = await dbConnection.query('DESCRIBE documents');
    const documentColumns = documentsTableInfo.map(col => col.Field);
    console.log('✓ Documents table structure verified');
    
    // Step 6: Create additional test feedback data
    console.log('\n=== STEP 6: Creating additional feedback data ===');
    
    // Get test student ID
    const [students] = await dbConnection.query('SELECT id FROM users WHERE role = "student" LIMIT 5');
    const studentIds = students.map(s => s.id);
    
    // Get course IDs
    const [courses] = await dbConnection.query('SELECT id FROM courses LIMIT 5');
    const courseIds = courses.map(c => c.id);
    
    // Insert feedback data
    if (studentIds.length > 0 && courseIds.length > 0) {
      // Create course enrollments to ensure students can submit feedback
      for (let i = 0; i < Math.min(studentIds.length, courseIds.length); i++) {
        const enrollmentId = uuidv4();
        await dbConnection.query(
          'INSERT IGNORE INTO course_enrollments (id, studentId, courseId, enrollmentDate, status) VALUES (?, ?, ?, CURDATE(), "active")',
          [enrollmentId, studentIds[i], courseIds[i]]
        );
      }
      
      // Create feedback entries
      for (let i = 0; i < Math.min(studentIds.length, courseIds.length); i++) {
        const feedbackId = uuidv4();
        const rating = Math.floor(Math.random() * 5) + 1; // 1-5 rating
        const comment = `This is test feedback ${i+1} for course evaluation. The course was ${rating >= 4 ? 'very good' : rating >= 3 ? 'good' : 'average'}.`;
        
        await dbConnection.query(
          'INSERT INTO feedback (id, studentId, courseId, rating, comment, status) VALUES (?, ?, ?, ?, ?, "pending")',
          [feedbackId, studentIds[i], courseIds[i], rating, comment]
        );
      }
      console.log(`✓ Created feedback entries for ${Math.min(studentIds.length, courseIds.length)} courses`);
    }
    
    // Step 7: Create additional document records
    console.log('\n=== STEP 7: Creating document records ===');
    
    // Get teacher IDs
    const [teachers] = await dbConnection.query('SELECT id FROM users WHERE role = "teacher" LIMIT 3');
    const teacherIds = teachers.map(t => t.id);
    
    if (teacherIds.length > 0 && documentColumns.includes('fileName')) {
      // Insert document records based on the actual table structure
      for (let i = 0; i < teacherIds.length; i++) {
        const documentId = uuidv4();
        await dbConnection.query(
          'INSERT INTO documents (id, fileName, ownerId, type, visibility, description, filePath) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            documentId,
            `Test Document ${i+1}.pdf`,
            teacherIds[i],
            'assignment',
            'public',
            `This is a test document ${i+1} for testing purposes.`,
            `uploads/documents/test-document-${i+1}.pdf`
          ]
        );
      }
      console.log(`✓ Created ${teacherIds.length} document records`);
    } else {
      console.log('✓ Skipped document creation - structure not as expected');
    }
    
    // Step 8: Create upload directories
    console.log('\n=== STEP 8: Creating upload directories ===');
    const uploadsDir = path.join(__dirname, '../uploads');
    const documentDir = path.join(uploadsDir, 'documents');
    const assignmentDir = path.join(uploadsDir, 'assignments');
    const profileDir = path.join(uploadsDir, 'profiles');
    
    // Create directories if they don't exist
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    if (!fs.existsSync(documentDir)) fs.mkdirSync(documentDir);
    if (!fs.existsSync(assignmentDir)) fs.mkdirSync(assignmentDir);
    if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir);
    console.log('✓ Upload directories created');
    
    await dbConnection.end();
    
    console.log('\n┌───────────────────────────────────────────────┐');
    console.log('│  DATABASE SETUP COMPLETED SUCCESSFULLY! 🎉    │');
    console.log('└───────────────────────────────────────────────┘');
    console.log('\nYou can now log in with the following credentials:');
    console.log('- Admin: admin@school.com / password123');
    console.log('- Teacher: teacher@school.com / password123');
    console.log('- Student: student@school.com / password123 (ID: f4b969e2-324a-4333-9624-d016a54ea06d)');
    console.log('- Parent: parent@school.com / password123');
    
    console.log('\nTo start the backend server, run:');
    console.log('  npm run dev');
    
  } catch (error) {
    console.error('Error during database setup:', error);
    process.exit(1);
  }
}

// Run the setup function
fullDatabaseSetup(); 