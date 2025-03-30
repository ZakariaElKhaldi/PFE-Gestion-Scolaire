/**
 * Main seed script that imports and runs all seed modules
 * Run with: node scripts/seed/index.js
 */
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Import seed modules
const seedUsers = require('./users');
const seedRelationships = require('./relationships');
const seedDepartments = require('./departments');
const seedCourses = require('./courses');
const seedClasses = require('./classes');
const seedAssignments = require('./assignments');
const seedAttendance = require('./attendance');
const seedMaterials = require('./materials');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedAll() {
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
    // Check if tables exist and handle duplicates
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Seed in sequence to maintain data dependencies
    const userData = await seedUsers(connection);
    console.log('✅ Users created successfully');
    
    await seedRelationships(connection, userData);
    console.log('✅ Relationships established successfully');
    
    const departmentData = await seedDepartments(connection, userData);
    console.log('✅ Departments created successfully');
    
    const courseData = await seedCourses(connection, userData);
    console.log('✅ Courses created and students enrolled successfully');
    
    const classData = await seedClasses(connection, courseData);
    console.log('✅ Classes and schedules created successfully');
    
    const assignmentData = await seedAssignments(connection, courseData, userData);
    console.log('✅ Assignments and submissions created successfully');
    
    await seedAttendance(connection, classData, userData);
    console.log('✅ Attendance records created successfully');
    
    await seedMaterials(connection, courseData);
    console.log('✅ Materials created successfully');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n🎉 Comprehensive seed completed successfully!');
    displayCredentials(userData);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

function displayCredentials(userData) {
  console.log('\nLogin Credentials:');
  console.log('- Admin: admin@school.com / password123');
  console.log('- Teacher 1: teacher@school.com / password123');
  console.log('- Teacher 2: science.teacher@school.com / password123');
  console.log(`- Student 1: student@school.com / password123 (ID: ${userData.studentId1})`);
  console.log('- Student 2: mike.student@school.com / password123');
  console.log('- Student 3: emma.student@school.com / password123');
  console.log('- Parent 1: parent@school.com / password123');
  console.log('- Parent 2: jane.parent@school.com / password123');
  
  console.log('\nCreated Data Summary:');
  console.log('- 3 Courses: Mathematics, Physics, Chemistry');
  console.log('- 3 Class schedules with weekly sessions');
  console.log('- 4 Assignments across different courses');
  console.log('- 2 Student submissions');
  console.log('- Attendance records for past 3 weeks');
  console.log('- 5 Course materials');
  console.log('- 2 Student grades');
}

// Run the seed function
seedAll(); 