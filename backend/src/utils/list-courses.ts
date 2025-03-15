import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

interface CourseRow extends RowDataPacket {
  id: string;
  name: string;
  teacherFirstName: string;
  teacherLastName: string;
}

interface FeedbackRow extends RowDataPacket {
  courseId: string;
}

interface UserRow extends RowDataPacket {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface EnrollmentRow extends RowDataPacket {
  enrollmentId: string;
  courseId: string;
  courseName: string;
}

async function listCourses() {
  console.log('Starting list-courses script...');
  
  try {
    // The specific user ID we want to check
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson's ID
    console.log(`Listing courses for student ID: ${studentId}`);
    
    // First check if the user exists
    const userQuery = `SELECT * FROM users WHERE id = ?`;
    const [userRows] = await pool.query<UserRow[]>(userQuery, [studentId]);
    if (!Array.isArray(userRows) || userRows.length === 0) {
      console.error(`User with ID ${studentId} not found!`);
    } else {
      console.log(`Found user: ${userRows[0].firstName} ${userRows[0].lastName}`);
    }
    
    // Check enrollments directly
    const enrollmentQuery = `
      SELECT 
        ce.id as enrollmentId, 
        ce.courseId, 
        c.name as courseName 
      FROM 
        course_enrollments ce
      JOIN 
        courses c ON ce.courseId = c.id
      WHERE 
        ce.studentId = ?
    `;
    
    const [enrollmentRows] = await pool.query<EnrollmentRow[]>(enrollmentQuery, [studentId]);
    console.log(`\nDirect enrollment check found ${Array.isArray(enrollmentRows) ? enrollmentRows.length : 0} enrollments:`);
    if (Array.isArray(enrollmentRows) && enrollmentRows.length > 0) {
      enrollmentRows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.courseName} (ID: ${row.courseId})`);
      });
    }
    
    // Query courses the student is enrolled in
    const courseQuery = `
      SELECT 
        c.id, 
        c.name, 
        u.firstName as teacherFirstName, 
        u.lastName as teacherLastName
      FROM 
        courses c 
      JOIN 
        course_enrollments ce ON c.id = ce.courseId 
      JOIN 
        users u ON c.teacherId = u.id
      WHERE 
        ce.studentId = ?
      ORDER BY 
        c.name
    `;
    
    const [courseRows] = await pool.query<CourseRow[]>(courseQuery, [studentId]);
    
    console.log(`\nCourse query found ${courseRows.length} courses for student`);
    if (courseRows.length > 0) {
      courseRows.forEach((course, index) => {
        console.log(`${index + 1}. ${course.name} (ID: ${course.id})`);
      });
    }
    
    // Now get all feedback from this student in a separate query
    const feedbackQuery = `
      SELECT DISTINCT courseId 
      FROM feedback
      WHERE studentId = ?
    `;
    
    const [feedbackRows] = await pool.query<FeedbackRow[]>(feedbackQuery, [studentId]);
    
    // Create a set of courseIds that have feedback
    const feedbackCourseIds = new Set(feedbackRows.map(row => row.courseId));
    console.log(`\nFound ${feedbackRows.length} courses with feedback`);
    if (feedbackRows.length > 0) {
      feedbackRows.forEach((row, index) => {
        console.log(`${index + 1}. Course ID: ${row.courseId}`);
      });
    }
    
    if (courseRows.length > 0) {
      console.log('\nCourses available for feedback:');
      console.log('===========================');
      
      // Display course information and feedback status
      for (const course of courseRows) {
        const hasFeedback = feedbackCourseIds.has(course.id);
        
        console.log(`
Course Name: ${course.name}
Course ID: ${course.id}
Teacher: ${course.teacherFirstName} ${course.teacherLastName}
Feedback Status: ${hasFeedback ? '✅ Already submitted' : '❌ Not submitted yet'}
------------------------------`);
      }
      
      // Find courses without feedback
      const coursesWithoutFeedback = courseRows.filter(course => !feedbackCourseIds.has(course.id));
      
      if (coursesWithoutFeedback.length > 0) {
        console.log(`\n👉 For testing, you can use these Course IDs that don't have feedback yet:`);
        coursesWithoutFeedback.forEach(course => {
          console.log(`   - ${course.id} (${course.name})`);
        });
      } else {
        console.log('\n⚠️ You have already submitted feedback for all your courses.');
        console.log('   To test with a new course, you need to enroll in another course first.');
      }
    } else {
      console.log('No courses found for this student. Try enrolling in some courses first.');
    }
    
  } catch (error) {
    console.error('Error in list-courses script:', error);
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
    await listCourses();
    console.log('Script completed successfully');
  } catch (err) {
    console.error('Script failed with error:', err);
  } finally {
    process.exit(0);
  }
})(); 