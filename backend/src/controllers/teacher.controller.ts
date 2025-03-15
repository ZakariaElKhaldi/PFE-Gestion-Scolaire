import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendServerError, sendBadRequest, sendNotFound } from '../utils/responseHandler';
import { TeacherService } from '../services/teacher.service';

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
        schedule
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
} 