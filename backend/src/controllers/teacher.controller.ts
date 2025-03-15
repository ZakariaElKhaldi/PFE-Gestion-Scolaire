import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendServerError, sendBadRequest, sendNotFound, sendForbidden, sendCreated } from '../utils/responseHandler';
import { TeacherService } from '../services/teacher.service';
import { assignmentService } from '../services/assignment.service';
import { courseModel } from '../models/course.model';

export class TeacherController {
  private teacherService: TeacherService;

  constructor() {
    this.teacherService = new TeacherService();
  }

  /**
   * Get dashboard statistics for a teacher
   */
  getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || req.user?.id;

    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }

    try {
      const dashboardStats = await this.teacherService.getDashboardStats(teacherId);
      
      return sendSuccess(res, {
        dashboardStats
      }, 'Teacher dashboard statistics retrieved successfully');
    } catch (error: any) {
      console.error('Error getting teacher dashboard stats:', error);
      
      if (error.message === 'Teacher not found') {
        return sendNotFound(res, 'Teacher not found');
      }
      
      return sendServerError(res, error.message || 'Failed to retrieve teacher dashboard stats');
    }
  });

  /**
   * Get teacher's schedule for a specific day
   */
  getScheduleByDay = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || req.user?.id;
    const { day } = req.params;

    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }

    if (!day) {
      return sendBadRequest(res, 'Day is required');
    }

    try {
      const schedule = await this.teacherService.getScheduleByDay(teacherId, day);
      
      return sendSuccess(res, {
        schedule: schedule || []
      }, 'Teacher schedule retrieved successfully');
    } catch (error: any) {
      console.error('Error getting teacher schedule:', error);
      return sendServerError(res, error.message || 'Failed to retrieve teacher schedule');
    }
  });

  /**
   * Get all students taught by a teacher
   */
  getStudents = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || req.user?.id;

    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }

    try {
      const students = await this.teacherService.getStudents(teacherId);
      
      return sendSuccess(res, {
        students
      }, 'Teacher students retrieved successfully');
    } catch (error: any) {
      console.error('Error getting teacher students:', error);
      return sendServerError(res, error.message || 'Failed to retrieve teacher students');
    }
  });

  /**
   * Get courses taught by a teacher
   */
  getCourses = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || req.user?.id;

    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }

    try {
      const courses = await this.teacherService.getCourses(teacherId);
      
      return sendSuccess(res, {
        courses
      }, 'Teacher courses retrieved successfully');
    } catch (error: any) {
      console.error('Error getting teacher courses:', error);
      return sendServerError(res, error.message || 'Failed to retrieve teacher courses');
    }
  });

  /**
   * Get assignments created by a teacher
   */
  getTeacherAssignments = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.params.teacherId || req.user?.id;
    const { courseId, status } = req.query as { courseId?: string; status?: string };

    if (!teacherId) {
      return sendBadRequest(res, 'Teacher ID is required');
    }

    try {
      // Use the teacherService method which uses assignmentService under the hood
      const assignments = await this.teacherService.getAssignments(teacherId, {
        courseId,
        status
      });
      
      return sendSuccess(res, { assignments }, 'Teacher assignments retrieved successfully');
    } catch (error: any) {
      console.error('Error getting teacher assignments:', error);
      return sendServerError(res, error.message || 'Failed to retrieve teacher assignments');
    }
  });

  /**
   * Create a new assignment for teacher's course
   */
  createTeacherAssignment = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { title, description, courseId, dueDate, points, status } = req.body;
    
    if (!teacherId || !title || !courseId || !dueDate) {
      return sendBadRequest(res, 'Missing required fields');
    }

    try {
      // Verify teacher is assigned to the course
      const isTeacherAssigned = await this.teacherService.isTeacherAssignedToCourse(teacherId, courseId);
      if (!isTeacherAssigned) {
        return sendForbidden(res, 'You are not authorized to create assignments for this course');
      }

      const assignment = await assignmentService.createAssignment({
        title,
        description,
        courseId,
        dueDate,
        points: points || 100,
        status: status || 'draft'
      }, teacherId);
      
      return sendCreated(res, { assignment }, 'Assignment created successfully');
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      return sendServerError(res, error.message || 'Failed to create assignment');
    }
  });

  /**
   * Get submissions for a specific assignment
   */
  getAssignmentSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { assignmentId } = req.params;
    
    if (!teacherId || !assignmentId) {
      return sendBadRequest(res, 'Missing required parameters');
    }

    try {
      // Verify the assignment belongs to the teacher
      const assignment = await assignmentService.getAssignment(assignmentId);
      if (!assignment) {
        return sendNotFound(res, 'Assignment not found');
      }
      
      // Get the course to check teacher ownership
      const course = await courseModel.findById(assignment.courseId);
      if (!course) {
        return sendNotFound(res, 'Course not found');
      }
      
      // Make sure the teacher owns this assignment
      if (course.teacherId !== teacherId) {
        return sendForbidden(res, 'You are not authorized to view submissions for this assignment');
      }

      const submissions = await assignmentService.getSubmissionsForAssignment(assignmentId);
      
      return sendSuccess(res, { submissions }, 'Assignment submissions retrieved successfully');
    } catch (error: any) {
      console.error('Error getting assignment submissions:', error);
      return sendServerError(res, error.message || 'Failed to retrieve assignment submissions');
    }
  });

  /**
   * Grade an assignment submission
   */
  gradeSubmission = asyncHandler(async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    
    if (!teacherId || !submissionId || grade === undefined) {
      return sendBadRequest(res, 'Missing required parameters');
    }

    try {
      // Verify teacher is authorized to grade this submission
      const isAuthorized = await this.teacherService.canTeacherGradeSubmission(teacherId, submissionId);
      if (!isAuthorized) {
        return sendForbidden(res, 'You are not authorized to grade this submission');
      }

      // Grade the submission
      const gradedSubmission = await assignmentService.gradeSubmission(
        submissionId, 
        {
          grade,
          feedback
        }, 
        teacherId
      );
      
      return sendSuccess(res, { submission: gradedSubmission }, 'Submission graded successfully');
    } catch (error: any) {
      console.error('Error grading submission:', error);
      return sendServerError(res, error.message || 'Failed to grade submission');
    }
  });
}

// Export a singleton instance
export const teacherController = new TeacherController(); 