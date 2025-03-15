import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface UserRow extends RowDataPacket {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface CourseRow extends RowDataPacket {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  startDate: Date;
  endDate: Date;
  status: string;
  enrollmentStatus: string;
}

interface EnrollmentRow extends RowDataPacket {
  id: string;
  courseId: string;
  studentId: string;
  status: string;
}

async function debugStudentCourses() {
  console.log('===== DEBUG: STUDENT COURSES API =====');
  
  try {
    // The specific user ID we want to check
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson's ID
    console.log(`Checking courses for student ID: ${studentId}`);

    // First check if the user exists
    const userQuery = `SELECT * FROM users WHERE id = ?`;
    const [userRows] = await pool.query<UserRow[]>(userQuery, [studentId]);
    
    if (userRows.length > 0) {
      console.log(`User check: ${userRows[0].firstName} ${userRows[0].lastName} (${userRows[0].role})`);
    } else {
      console.log('User not found in database!');
    }
    
    // Check database pool
    console.log('Database pool state: ', pool ? 'Available' : 'Not available');
    
    // Direct query to check courses
    const query = `
      SELECT c.id, c.name, c.code, c.description, c.credits, c.startDate, c.endDate, c.status,
             ce.status as enrollmentStatus
      FROM courses c
      JOIN course_enrollments ce ON c.id = ce.courseId
      WHERE ce.studentId = ?
    `;
    
    console.log('Executing direct query for student courses...');
    const [rows] = await pool.query<CourseRow[]>(query, [studentId]);
    
    console.log(`Found ${rows.length} courses for student ${studentId}`);
    
    // Log each course
    rows.forEach((row: CourseRow, index: number) => {
      console.log(`Course ${index + 1}:`);
      console.log(`  ID: ${row.id}`);
      console.log(`  Name: ${row.name}`);
      console.log(`  Code: ${row.code}`);
      console.log(`  Status: ${row.status}`);
      console.log(`  Enrollment Status: ${row.enrollmentStatus}`);
    });
    
    // Check course enrollments directly
    const enrollmentsQuery = `
      SELECT * FROM course_enrollments WHERE studentId = ?
    `;
    
    const [enrollmentRows] = await pool.query<EnrollmentRow[]>(enrollmentsQuery, [studentId]);
    console.log(`Found ${enrollmentRows.length} course enrollments`);
    
    // Check if student.routes.ts has the correct route
    console.log('\nChecking for possible issues:');
    console.log('1. Check if student.routes.ts has GET /courses endpoint registered');
    console.log('2. Check if app.ts has the student router mounted at /api/students');
    console.log('3. Check if the frontend is calling the correct endpoint: /api/students/courses');
    console.log('4. Check network tab in browser for errors when fetching courses');
    
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  } finally {
    console.log('\nClosing database connection...');
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the script
debugStudentCourses()
  .then(() => console.log('Debug completed'))
  .catch(err => console.error('Debug script error:', err)); 