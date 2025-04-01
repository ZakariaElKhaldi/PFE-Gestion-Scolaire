import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { feedbackModel } from '../models/feedback.model';

interface CourseRow extends RowDataPacket {
  id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  teacherFirstName: string;
  teacherLastName: string;
}

async function listStudentCourses() {
  console.log('Starting list-student-courses script...');
  
  try {
    // The specific user ID we want to check
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson's ID
    console.log(`Listing courses for student ID: ${studentId}`);
    
    // Query courses the student is enrolled in
    const query = `
      SELECT c.*, u.firstName as teacherFirstName, u.lastName as teacherLastName 
      FROM courses c 
      JOIN course_enrollments ce ON c.id = ce.courseId 
      JOIN users u ON c.teacherId = u.id
      WHERE ce.studentId = ?
      ORDER BY c.name
    `;
    
    const [rows] = await pool.query<CourseRow[]>(query, [studentId]);
    
    console.log(`Found ${rows.length} courses for student`);
    
    if (rows.length > 0) {
      console.log('\nCourses available for feedback:');
      console.log('===========================');
      
      // Now check for existing feedback
      for (const course of rows) {
        const hasFeedback = await feedbackModel.hasSubmittedFeedback(studentId, course.id);
        
        console.log(`
Course Name: ${course.name}
Course ID: ${course.id}
Teacher: ${course.teacherFirstName} ${course.teacherLastName}
Feedback Status: ${hasFeedback ? '✅ Already submitted' : '❌ Not submitted yet'}
------------------------------`);
      }
      
      // Show a recommendation for testing
      const courseWithoutFeedback = rows.find(async (course) => {
        const hasFeedback = await feedbackModel.hasSubmittedFeedback(studentId, course.id);
        return !hasFeedback;
      });
      
      if (courseWithoutFeedback) {
        console.log(`\n👉 For testing, you can use Course ID: ${courseWithoutFeedback.id} (${courseWithoutFeedback.name})`);
      }
    } else {
      console.log('No courses found for this student. Try enrolling in some courses first.');
    }
    
  } catch (error) {
    console.error('Error in list-student-courses script:', error);
  } finally {
    console.log('\nClosing database pool...');
    await pool.end();
    console.log('Database pool closed');
  }
}

// Run the script
listStudentCourses()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 