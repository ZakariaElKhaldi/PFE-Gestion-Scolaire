import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { feedbackModel } from '../models/feedback.model';
import { userModel } from '../models/user.model';
import { courseModel } from '../models/course.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';

async function createFeedbackForStudent() {
  console.log('Starting create-feedback-for-student script...');
  
  try {
    console.log('Creating database pool...');
    
    // Initialize the feedback model
    await feedbackModel.initialize();
    
    // Get the specific student - Student Johnson
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d'; // Student Johnson's ID
    console.log(`Finding student with ID: ${studentId}`);
    
    const student = await userModel.findById(studentId);
    
    if (!student) {
      console.error(`Student with ID ${studentId} not found`);
      return;
    }
    
    console.log(`Found student: ${student.firstName} ${student.lastName} (${student.id})`);
    
    // Get the first few courses
    console.log('Finding courses...');
    const courses = await courseModel.findAll();
    
    if (!courses.length) {
      console.error('No courses found in the database');
      return;
    }
    
    // Create feedback for 3 different courses
    const coursesToUse = courses.slice(0, 3);
    
    for (let i = 0; i < coursesToUse.length; i++) {
      const course = coursesToUse[i];
      console.log(`Processing course: ${course.name} (${course.id})`);
      
      // Ensure the student is enrolled in the course
      console.log('Checking student enrollment...');
      const enrollment = await courseEnrollmentModel.findByCourseAndStudent(course.id, student.id);
      
      if (!enrollment) {
        console.log('Student is not enrolled in the course, enrolling now...');
        try {
          await courseEnrollmentModel.enroll(course.id, student.id);
          console.log('Student enrolled in the course successfully');
        } catch (enrollError) {
          console.error('Error enrolling student:', enrollError);
          continue; // Skip this course if enrollment fails
        }
      } else {
        console.log('Student is already enrolled in the course');
      }
      
      // Check if feedback already exists
      const hasSubmitted = await feedbackModel.hasSubmittedFeedback(student.id, course.id);
      
      if (hasSubmitted) {
        console.log(`Student has already submitted feedback for course ${course.name}`);
        continue; // Skip this course if feedback already exists
      }
      
      // Submit feedback
      console.log(`Submitting feedback for course: ${course.name}`);
      const ratings = [4, 5, 3]; // Different ratings for variety
      const comments = [
        'This course was excellent! The materials were well-organized and the instructor was knowledgeable.',
        'I learned a lot from this course. The hands-on projects were particularly helpful.',
        'Good course overall, but some topics could have been explained better. The assignments were challenging but valuable.'
      ];
      
      try {
        const feedbackId = await feedbackModel.create({
          studentId: student.id,
          courseId: course.id,
          rating: ratings[i],
          comment: comments[i]
        });
        
        console.log(`Successfully created feedback with ID: ${feedbackId} for course ${course.name}`);
      } catch (feedbackError) {
        console.error(`Error creating feedback for course ${course.name}:`, feedbackError);
      }
    }
    
    // Verify the feedback was created
    console.log('\nVerifying feedback creation...');
    const feedbackEntries = await feedbackModel.getByStudentId(student.id);
    
    if (feedbackEntries.length > 0) {
      console.log(`Successfully created ${feedbackEntries.length} feedback entries:`);
      feedbackEntries.forEach(feedback => {
        console.log(`- Course: ${feedback.courseName}, Rating: ${feedback.rating}, Comment: ${feedback.comment.substring(0, 30)}...`);
      });
    } else {
      console.error('No feedback entries found for the student');
    }
    
  } catch (error) {
    console.error('Error in create-feedback-for-student script:', error);
  } finally {
    console.log('Closing database pool...');
    await pool.end();
    console.log('Database pool closed');
  }
}

// Run the script
createFeedbackForStudent()
  .then(() => console.log('Script completed'))
  .catch(err => console.error('Script failed:', err)); 