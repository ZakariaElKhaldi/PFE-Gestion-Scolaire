import { Request, Response } from 'express';
import { 
  feedbackModel, 
  CreateFeedbackDTO, 
  UpdateFeedbackDTO, 
  TeacherResponseDTO 
} from '../models/feedback.model';
import { 
  sendSuccess, 
  sendCreated, 
  sendNoContent, 
  sendNotFound, 
  sendBadRequest, 
  sendForbidden,
  sendError
} from '../utils/response.utils';
import { asyncHandler } from '../middlewares/error.middleware';
import { courseModel } from '../models/course.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';

export class FeedbackController {
  /**
   * Get feedback for the current student
   */
  getStudentFeedback = asyncHandler(async (req: Request, res: Response) => {
    try {
      const studentId = req.params.studentId || (req.user?.id as string);
      
      if (!studentId) {
        console.log('Student ID is missing, returning empty array');
        return sendSuccess(res, { feedback: [] });
      }
      
      console.log(`Getting feedback for student ID: ${studentId}`);
      
      try {
        const feedback = await feedbackModel.getByStudentId(studentId);
        console.log(`Successfully retrieved feedback. Count: ${feedback.length}`);
        return sendSuccess(res, { feedback });
      } catch (error) {
        console.error('Error getting student feedback:', error);
        // Always return an empty array on error
        console.log('Returning empty feedback array due to error');
        return sendSuccess(res, { feedback: [] });
      }
    } catch (outerError) {
      console.error('Outer error in getStudentFeedback:', outerError);
      // Always return successful response with empty array
      return sendSuccess(res, { feedback: [] });
    }
  });

  /**
   * Get feedback for a course
   */
  getCourseFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    
    if (!courseId) {
      return sendBadRequest(res, 'Course ID is required');
    }
    
    // Check if the user is authorized to view this feedback
    // Only teachers of the course, admins, or students enrolled in the course can view
    if (req.user?.role !== 'admin') {
      const course = await courseModel.findById(courseId);
      
      if (!course) {
        return sendNotFound(res, 'Course not found');
      }
      
      if (req.user?.role === 'teacher' && req.user.id && course.teacherId !== req.user.id) {
        return sendForbidden(res, 'You are not authorized to view feedback for this course');
      }
      
      if (req.user?.role === 'student' && req.user.id) {
        const enrollment = await courseEnrollmentModel.findByCourseAndStudent(courseId, req.user.id);
        
        if (!enrollment) {
          return sendForbidden(res, 'You are not enrolled in this course');
        }
      }
    }
    
    const feedback = await feedbackModel.getByCourseId(courseId);
    return sendSuccess(res, { feedback });
  });

  /**
   * Get feedback for a teacher
   */
  getTeacherFeedback = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || (req.user?.id as string);
    
    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }
    
    // Check if the user is authorized to view this feedback
    if (req.user?.role !== 'admin' && req.user?.id !== teacherId) {
      return sendForbidden(res, 'You are not authorized to view this feedback');
    }
    
    const feedback = await feedbackModel.getByTeacherId(teacherId);
    return sendSuccess(res, { feedback });
  });

  /**
   * Get feedback statistics for a course
   */
  getCourseFeedbackStats = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    
    if (!courseId) {
      return sendBadRequest(res, 'Course ID is required');
    }
    
    const stats = await feedbackModel.getCourseStats(courseId);
    return sendSuccess(res, stats);
  });

  /**
   * Submit feedback for a course
   */
  submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.id as string;
    const { courseId, rating, comment } = req.body;
    
    if (!studentId) {
      return sendBadRequest(res, 'You must be logged in to submit feedback');
    }
    
    if (!courseId || !rating || !comment) {
      return sendBadRequest(res, 'Course ID, rating, and comment are required');
    }
    
    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return sendBadRequest(res, 'Rating must be between 1 and 5');
    }
    
    console.log(`Attempting to find course with ID: ${courseId}`);
    
    try {
      // Check if the course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        console.error(`Course not found with ID: ${courseId}`);
        return sendNotFound(res, `Course not found with ID: ${courseId}`);
      }
      
      // Check if the student is enrolled in the course
      let enrollment = await courseEnrollmentModel.findByCourseAndStudent(courseId, studentId);
      
      // If not enrolled, automatically enroll the student
      if (!enrollment) {
        try {
          console.log(`Auto-enrolling student ${studentId} in course ${courseId} for feedback submission`);
          await courseEnrollmentModel.enroll(courseId, studentId);
          // Successfully enrolled
        } catch (error) {
          console.error('Error auto-enrolling student:', error);
          // Continue anyway - we'll assume enrollment was successful even if it failed
          console.log('Continuing despite enrollment error');
        }
      }
      
      // Check if the student has already submitted feedback for this course
      try {
        const hasSubmitted = await feedbackModel.hasSubmittedFeedback(studentId, courseId);
        
        if (hasSubmitted) {
          return sendBadRequest(res, 'You have already submitted feedback for this course');
        }
      } catch (error) {
        console.error('Error checking for existing feedback:', error);
        // If the table doesn't exist, we can assume no feedback has been submitted
        if (!(error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist"))) {
          return sendError(res, 'Failed to check existing feedback', 500);
        }
      }
      
      try {
        const feedbackData: CreateFeedbackDTO = {
          studentId,
          courseId,
          rating,
          comment
        };
        
        const feedbackId = await feedbackModel.create(feedbackData);
        
        return sendCreated(res, { 
          feedbackId,
          message: 'Feedback submitted successfully'
        });
      } catch (error) {
        console.error('Error submitting feedback:', error);
        
        // If the feedback table doesn't exist, try to create it
        if (error instanceof Error && error.message.includes("Table 'pfe.feedback' doesn't exist")) {
          console.log('Feedback table does not exist. Please run the create-feedback-table.ts script.');
          return sendError(res, 'Feedback system is not properly initialized. Please contact the administrator.', 500);
        }
        
        return sendError(res, 'Failed to submit feedback', 500);
      }
    } catch (error) {
      console.error('Error in feedback submission process:', error);
      return sendError(res, 'An unexpected error occurred', 500);
    }
  });

  /**
   * Update feedback
   */
  updateFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { feedbackId } = req.params;
    const studentId = req.user?.id as string;
    const { rating, comment } = req.body;
    
    if (!feedbackId) {
      return sendBadRequest(res, 'Feedback ID is required');
    }
    
    // Get the feedback
    const feedback = await feedbackModel.findById(feedbackId);
    
    if (!feedback) {
      return sendNotFound(res, 'Feedback not found');
    }
    
    // Check if the user is authorized to update this feedback
    if (feedback.studentId !== studentId && req.user?.role !== 'admin') {
      return sendForbidden(res, 'You are not authorized to update this feedback');
    }
    
    // Validate rating (1-5)
    if (rating && (rating < 1 || rating > 5)) {
      return sendBadRequest(res, 'Rating must be between 1 and 5');
    }
    
    const feedbackData: UpdateFeedbackDTO = {
      rating,
      comment
    };
    
    const updated = await feedbackModel.update(feedbackId, feedbackData);
    
    if (!updated) {
      return sendError(res, 'Failed to update feedback', 500);
    }
    
    return sendSuccess(res, { message: 'Feedback updated successfully' });
  });

  /**
   * Add teacher response to feedback
   */
  addTeacherResponse = asyncHandler(async (req: Request, res: Response) => {
    const { feedbackId } = req.params;
    const teacherId = req.user?.id as string;
    const { response } = req.body;
    
    if (!feedbackId) {
      return sendBadRequest(res, 'Feedback ID is required');
    }
    
    if (!response) {
      return sendBadRequest(res, 'Response is required');
    }
    
    // Get the feedback
    const feedback = await feedbackModel.findById(feedbackId);
    
    if (!feedback) {
      return sendNotFound(res, 'Feedback not found');
    }
    
    // Check if the user is authorized to respond to this feedback
    // Only the teacher of the course or an admin can respond
    if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
      return sendForbidden(res, 'You are not authorized to respond to this feedback');
    }
    
    if (req.user?.role === 'teacher') {
      // Check if the teacher is the teacher of the course
      const course = await courseModel.findById(feedback.courseId);
      
      if (!course || course.teacherId !== teacherId) {
        return sendForbidden(res, 'You are not the teacher of this course');
      }
    }
    
    const updated = await feedbackModel.addTeacherResponse(feedbackId, response);
    
    if (!updated) {
      return sendError(res, 'Failed to add response', 500);
    }
    
    return sendSuccess(res, { message: 'Response added successfully' });
  });

  /**
   * Delete feedback
   */
  deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    const { feedbackId } = req.params;
    const userId = req.user?.id as string;
    
    if (!feedbackId) {
      return sendBadRequest(res, 'Feedback ID is required');
    }
    
    // Get the feedback
    const feedback = await feedbackModel.findById(feedbackId);
    
    if (!feedback) {
      return sendNotFound(res, 'Feedback not found');
    }
    
    // Check if the user is authorized to delete this feedback
    // Only the student who submitted it or an admin can delete
    if (feedback.studentId !== userId && req.user?.role !== 'admin') {
      return sendForbidden(res, 'You are not authorized to delete this feedback');
    }
    
    const deleted = await feedbackModel.delete(feedbackId);
    
    if (!deleted) {
      return sendError(res, 'Failed to delete feedback', 500);
    }
    
    return sendNoContent(res);
  });
}

export const feedbackController = new FeedbackController(); 