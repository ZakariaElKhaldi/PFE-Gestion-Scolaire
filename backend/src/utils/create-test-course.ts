import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { RowDataPacket } from 'mysql2';

interface TeacherRow extends RowDataPacket {
  id: string;
}

interface DepartmentRow extends RowDataPacket {
  id: string;
}

async function createTestCourse() {
  console.log('Starting create-test-course script...');
  
  try {
    // The specific user ID we want to enroll
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson's ID
    
    // Get a teacher ID to assign to the course
    const teacherQuery = `
      SELECT id FROM users WHERE role = 'teacher' LIMIT 1
    `;
    
    const [teacherRows] = await pool.query<TeacherRow[]>(teacherQuery);
    if (!teacherRows.length) {
      throw new Error('No teacher found in the database');
    }
    
    const teacherId = teacherRows[0].id;
    console.log(`Using teacher ID: ${teacherId}`);
    
    // Create a new course with a unique name
    const courseId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const courseName = `Test Course ${timestamp}`;
    
    // Insert the new course
    const insertCourseQuery = `
      INSERT INTO courses (
        id, 
        name, 
        code,
        description, 
        teacherId, 
        departmentId, 
        startDate, 
        endDate, 
        status,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const departmentQuery = `
      SELECT id FROM departments LIMIT 1
    `;
    
    const [departmentRows] = await pool.query<DepartmentRow[]>(departmentQuery);
    if (!departmentRows.length) {
      throw new Error('No department found in the database');
    }
    
    const departmentId = departmentRows[0].id;
    
    // Set dates for the course
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 4); // Course ends in 4 months
    
    await pool.query(insertCourseQuery, [
      courseId,
      courseName,
      `TEST${timestamp}`,
      `This is a test course created for feedback testing on ${new Date().toLocaleDateString()}`,
      teacherId,
      departmentId,
      startDate,
      endDate,
      'active'
    ]);
    
    console.log(`Created new course: ${courseName} (ID: ${courseId})`);
    
    // Enroll the student in the course
    const enrollmentQuery = `
      INSERT INTO course_enrollments (
        id,
        courseId,
        studentId,
        status,
        enrollmentDate,
        createdAt,
        updatedAt
      ) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())
    `;
    
    const enrollmentId = uuidv4();
    await pool.query(enrollmentQuery, [
      enrollmentId,
      courseId,
      studentId,
      'active'
    ]);
    
    console.log(`Enrolled student ${studentId} in course ${courseId}`);
    
    console.log(`
=================================================
TEST COURSE CREATION SUCCESSFUL
=================================================
Course Name: ${courseName}
Course ID: ${courseId}
Teacher ID: ${teacherId}
Student ID: ${studentId}
-------------------------------------------------
You can now test submitting feedback for this course.
For testing, use this Course ID: ${courseId}
=================================================
`);
    
  } catch (error) {
    console.error('Error in create-test-course script:', error);
  } finally {
    try {
      console.log('\nClosing database pool...');
      await pool.end();
      console.log('Database pool closed successfully');
    } catch (closeError) {
      console.error('Error closing database pool:', closeError);
    }
  }
}

// Run the script
(async () => {
  try {
    await createTestCourse();
    console.log('Script completed successfully');
  } catch (err) {
    console.error('Script failed with error:', err);
  } finally {
    process.exit(0);
  }
})(); 