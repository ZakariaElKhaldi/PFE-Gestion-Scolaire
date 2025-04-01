import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';
import { feedbackModel } from '../models/feedback.model';

interface FeedbackRow extends RowDataPacket {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  rating: number;
  comment: string;
  submittedAt: Date;
  status: string;
}

async function checkUserFeedback() {
  console.log('Starting check-user-feedback script...');
  
  try {
    // Initialize the feedback model to ensure table exists
    await feedbackModel.initialize();
    
    // The specific user ID we want to check
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson
    console.log(`Checking feedback for user ID: ${studentId}`);
    
    // Direct database query to check for feedback
    const [feedbackRows] = await pool.query<FeedbackRow[]>(
      'SELECT * FROM feedback WHERE studentId = ?',
      [studentId]
    );
    
    console.log(`Found ${feedbackRows.length} feedback entries in raw database query`);
    
    if (feedbackRows.length > 0) {
      console.log('Raw feedback entries:');
      feedbackRows.forEach((row, index) => {
        console.log(`[${index + 1}] ID: ${row.id}, CourseID: ${row.courseId}, Rating: ${row.rating}`);
      });
      
      // Get course names for better context
      for (const row of feedbackRows) {
        try {
          const [courseRows] = await pool.query<(RowDataPacket & { name: string })[]>(
            'SELECT name FROM courses WHERE id = ?',
            [row.courseId]
          );
          
          if (courseRows.length > 0) {
            console.log(`Course ID ${row.courseId} is for course: ${courseRows[0].name}`);
          } else {
            console.log(`Course ID ${row.courseId} not found in courses table`);
          }
        } catch (err) {
          console.error(`Error getting course name for ID ${row.courseId}:`, err);
        }
      }
    }
    
    // Now try using the model method to compare
    console.log('\nNow trying to get feedback using model.getByStudentId():');
    try {
      const modelFeedback = await feedbackModel.getByStudentId(studentId);
      console.log(`getByStudentId() returned ${modelFeedback.length} items`);
      
      if (modelFeedback.length > 0) {
        console.log('Model feedback results:');
        modelFeedback.forEach((item, index) => {
          console.log(`[${index + 1}] Course: ${item.courseName}, Rating: ${item.rating}`);
        });
      } else {
        console.log('No feedback found using the model method');
        
        // If we found raw entries but the model returns none, there's likely a JOIN issue
        if (feedbackRows.length > 0) {
          console.log('\nDETECTED ISSUE: Raw feedback exists but model query returns nothing.');
          console.log('This is likely due to an issue with the JOIN queries in the model.');
          
          // Try a simpler query that might work
          const query = `
            SELECT f.*, c.name as courseName
            FROM feedback f
            JOIN courses c ON f.courseId = c.id
            WHERE f.studentId = ?
          `;
          
          const [simpleJoinRows] = await pool.query<(FeedbackRow & { courseName: string })[]>(
            query,
            [studentId]
          );
          
          console.log(`\nSimple JOIN query returned ${simpleJoinRows.length} items`);
          
          if (simpleJoinRows.length > 0) {
            console.log('Simple JOIN results:');
            simpleJoinRows.forEach((item, index) => {
              console.log(`[${index + 1}] Course: ${item.courseName}, Rating: ${item.rating}`);
            });
            console.log('\nThis confirms that the issue is with the complex JOIN query in the model.');
          }
        }
      }
    } catch (modelError) {
      console.error('Error using model.getByStudentId():', modelError);
    }
    
    // Check for mock-course-2 specifically since that's what the user is trying to submit for
    console.log('\nChecking for feedback on mock-course-2 specifically:');
    const [mockCourseRows] = await pool.query<FeedbackRow[]>(
      'SELECT * FROM feedback WHERE studentId = ? AND courseId = ?',
      [studentId, 'mock-course-2']
    );
    
    if (mockCourseRows.length > 0) {
      console.log('Found feedback for mock-course-2:');
      console.log(mockCourseRows[0]);
    } else {
      console.log('No feedback found for mock-course-2');
    }
    
  } catch (error) {
    console.error('Error in check-user-feedback script:', error);
  } finally {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
  }
}

// Run the script
checkUserFeedback()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 