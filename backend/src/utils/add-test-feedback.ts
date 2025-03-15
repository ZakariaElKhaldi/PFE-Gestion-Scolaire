import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { feedbackModel } from '../models/feedback.model';
import { userModel } from '../models/user.model';
import { courseModel } from '../models/course.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';

async function addTestFeedback() {
  console.log('Starting add-test-feedback script...');
  
  try {
    console.log('Creating database pool...');
    console.log(`Database config: ${JSON.stringify({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      database: process.env.DB_NAME || 'pfe'
    })}`);
    
    // Initialize the feedback model
    await feedbackModel.initialize();
    
    // Get the first student user
    console.log('Finding a student user...');
    const students = await userModel.findAll('student');
    
    if (!students.length) {
      console.error('No student users found in the database');
      return;
    }
    
    const student = students[0];
    console.log(`Found student: ${student.firstName} ${student.lastName} (${student.id})`);
    
    // Get the first course
    console.log('Finding a course...');
    const courses = await courseModel.findAll();
    
    if (!courses.length) {
      console.error('No courses found in the database');
      return;
    }
    
    const course = courses[0];
    console.log(`Found course: ${course.name} (${course.id})`);
    
    // Ensure the student is enrolled in the course
    console.log('Checking student enrollment...');
    const enrollment = await courseEnrollmentModel.findByCourseAndStudent(course.id, student.id);
    
    if (!enrollment) {
      console.log('Student is not enrolled in the course, enrolling now...');
      await courseEnrollmentModel.enroll(course.id, student.id);
      console.log('Student enrolled in the course successfully');
    } else {
      console.log('Student is already enrolled in the course');
    }
    
    // Submit feedback
    console.log('Submitting test feedback...');
    const feedbackId = await feedbackModel.create({
      studentId: student.id,
      courseId: course.id,
      rating: 5,
      comment: 'This is a test feedback. The course was excellent and I learned a lot!'
    });
    
    console.log(`Successfully created feedback with ID: ${feedbackId}`);
    
    // Verify the feedback was created
    console.log('Verifying feedback creation...');
    const feedback = await feedbackModel.findById(feedbackId);
    
    if (feedback) {
      console.log('Feedback created successfully:');
      console.log(JSON.stringify(feedback, null, 2));
    } else {
      console.error('Failed to retrieve created feedback');
    }
    
  } catch (error) {
    console.error('Error in add-test-feedback script:', error);
  } finally {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
  }
}

// Run the script
addTestFeedback()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 