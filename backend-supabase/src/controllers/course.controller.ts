import { Request, Response } from 'express';
import { courseModel, CourseStatus } from '../models/course.model';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { UserRole } from '../types/auth';

class CourseController {
  /**
   * Get all courses with optional filters
   */
  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId, teacherId, status } = req.query;
      
      const filters = {
        departmentId: departmentId as string | undefined,
        teacherId: teacherId as string | undefined,
        status: status as CourseStatus | undefined
      };
      
      const courses = await courseModel.findAll(filters);
      
      res.status(200).json({
        error: false,
        data: { courses }
      });
    } catch (error) {
      logger.error('Error getting all courses:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to retrieve courses'
      });
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const includeDetails = req.query.includeDetails === 'true';
      
      const course = await courseModel.findById(id, includeDetails);
      
      if (!course) {
        throw ApiError.notFound('Course not found');
      }
      
      res.status(200).json({
        error: false,
        data: { course }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error getting course by ID:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to retrieve course'
        });
      }
    }
  }

  /**
   * Create new course
   */
  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const { name, code, description, credits, departmentId, teacherId, startDate, endDate, maxStudents, status } = req.body;
      
      // Validate required fields
      if (!name || !code) {
        throw ApiError.badRequest('Course name and code are required');
      }
      
      // Check if user is authorized to assign a teacher
      if (teacherId && req.user?.role !== UserRole.ADMINISTRATOR) {
        throw ApiError.forbidden('Only administrators can assign teachers to courses');
      }
      
      const course = await courseModel.create({
        name,
        code,
        description,
        credits,
        departmentId,
        teacherId,
        startDate,
        endDate,
        maxStudents,
        status
      });
      
      if (!course) {
        throw ApiError.internal('Failed to create course');
      }
      
      res.status(201).json({
        error: false,
        message: 'Course created successfully',
        data: { course }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error creating course:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to create course'
        });
      }
    }
  }

  /**
   * Update course
   */
  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, code, description, credits, departmentId, teacherId, startDate, endDate, maxStudents, status } = req.body;
      
      // Check if course exists
      const existingCourse = await courseModel.findById(id);
      if (!existingCourse) {
        throw ApiError.notFound('Course not found');
      }
      
      // Check authorization for non-admin users
      if (req.user?.role !== UserRole.ADMINISTRATOR) {
        // Teachers can only update their own courses
        if (req.user?.role === UserRole.TEACHER && existingCourse.teacherId !== req.user.userId) {
          throw ApiError.forbidden('You can only update courses assigned to you');
        }
        
        // Non-admin users cannot change teacher assignment
        if (teacherId && teacherId !== existingCourse.teacherId) {
          throw ApiError.forbidden('Only administrators can change teacher assignments');
        }
        
        // Non-admin users cannot change department
        if (departmentId && departmentId !== existingCourse.departmentId) {
          throw ApiError.forbidden('Only administrators can change department assignments');
        }
      }
      
      // Update course
      const updatedCourse = await courseModel.update(id, {
        name,
        code,
        description,
        credits,
        departmentId,
        teacherId,
        startDate,
        endDate,
        maxStudents,
        status
      });
      
      if (!updatedCourse) {
        throw ApiError.internal('Failed to update course');
      }
      
      res.status(200).json({
        error: false,
        message: 'Course updated successfully',
        data: { course: updatedCourse }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error updating course:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to update course'
        });
      }
    }
  }

  /**
   * Delete course
   */
  async deleteCourse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if course exists
      const existingCourse = await courseModel.findById(id);
      if (!existingCourse) {
        throw ApiError.notFound('Course not found');
      }
      
      // Only administrators can delete courses
      if (req.user?.role !== UserRole.ADMINISTRATOR) {
        throw ApiError.forbidden('Only administrators can delete courses');
      }
      
      // Delete course
      const deleted = await courseModel.delete(id);
      
      if (!deleted) {
        throw ApiError.internal('Failed to delete course');
      }
      
      res.status(200).json({
        error: false,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          error: true,
          message: error.message
        });
      } else {
        logger.error('Error deleting course:', error);
        res.status(500).json({
          error: true,
          message: 'Failed to delete course'
        });
      }
    }
  }
}

export const courseController = new CourseController(); 