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
const seedDocuments = require('./documents');
const seedFeedback = require('./feedback');
const seedLoginAttempts = require('./login_attempts');
const seedMessages = require('./messages');
const seedCertificates = require('./certificates');
const seedPayments = require('./payments');

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
    
    await seedDocuments(connection, userData);
    console.log('✅ Documents created successfully');
    
    await seedFeedback(connection, userData, courseData);
    console.log('✅ Course feedback created successfully');
    
    await seedLoginAttempts(connection, userData);
    console.log('✅ Login attempts created successfully');
    
    await seedMessages(connection, userData);
    console.log('✅ Messages created successfully');
    
    await seedCertificates(connection, userData);
    console.log('✅ Certificates created successfully');
    
    await seedPayments();
    console.log('✅ Payments, invoices and payment methods created successfully');
    
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
  console.log('\n=== Login Credentials ===');
  console.log('\n- Administrators:');
  console.log('  • Admin: admin@school.com / password123');
  console.log('  • Director: director@school.com / password123');
  
  console.log('\n- Teachers:');
  console.log('  • English Teacher: teacher@school.com / password123');
  console.log('  • Science Teacher: science.teacher@school.com / password123');
  console.log('  • Math Teacher: math.teacher@school.com / password123');
  console.log('  • History Teacher: history.teacher@school.com / password123');
  
  console.log('\n- Students:');
  console.log(`  • Student Johnson: student@school.com / password123 (ID: ${userData.studentId1})`);
  console.log(`  • Mike Williams: mike.student@school.com / password123 (ID: ${userData.studentId2})`);
  console.log(`  • Emma Davis: emma.student@school.com / password123 (ID: ${userData.studentId3})`);
  console.log(`  • Alex Martinez: alex.student@school.com / password123 (ID: ${userData.studentId4})`);
  console.log(`  • Sophia Brown: sophia.student@school.com / password123 (ID: ${userData.studentId5})`);
  
  console.log('\n- Parents:');
  console.log('  • Robert Johnson: parent@school.com / password123 (Parent of Student Johnson, Guardian of Sophia)');
  console.log('  • Jane Williams: jane.parent@school.com / password123 (Parent of Mike, Emergency Contact for Emma)');
  console.log('  • Robert Davis: robert.parent@school.com / password123 (Parent of Emma)');
  console.log('  • Maria Martinez: maria.parent@school.com / password123 (Parent of Alex)');
  
  console.log('\n=== Created Data Summary ===');
  console.log('- 3 Courses: Mathematics, Physics, Chemistry');
  console.log('- 3 Class schedules with weekly sessions');
  console.log('- 4 Assignments across different courses');
  console.log('- 2 Student submissions');
  console.log('- Attendance records for past 3 weeks');
  console.log('- 5 Course materials');
  console.log('- 2 Student grades');
  console.log('- 5 Documents (various types)');
  console.log('- 4 Course feedback entries');
  console.log('- 4 Login attempt records');
  console.log('- 6 Messages between users');
  console.log('- 5 Student certificates with QR codes');
  console.log('- Multiple payments, invoices and payment methods for each student');
  
  console.log('\n=== User Relationships ===');
  console.log('- Parent-Child Relationships: 6 total relationships');
  console.log('- Primary parent relationships: 4 (one for each family)');
  console.log('- Cross-family relationships: 2 (guardian, emergency contact)');
  
  console.log('\n=== User Profile Features ===');
  console.log('- Profile Pictures: All users have profile pictures from randomuser.me');
  console.log('- User Bios: All users have detailed biographical information');
  console.log('- Contact Information: All users have phone numbers');
}

// Run the seed function
seedAll(); 