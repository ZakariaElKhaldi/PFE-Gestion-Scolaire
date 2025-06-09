import { Request, Response } from 'express';
import { enrollmentModel, EnrollmentInput, EnrollmentStatus } from '../models/enrollment.model';
import { userModel } from '../models/user.model';
import { courseModel } from '../models/course.model';
import { logger } from '../utils/logger';
import { UserRole } from '../types/auth';

export class EnrollmentController {
  /**
   * Enroll a student in a course
   */
  async enroll(req: Request, res: Response): Promise<void> {
    try {
      const { courseId, studentId } = req.body;
      
      // Validate input
      if (!courseId || !studentId) {
        res.status(400).json({ error: 'Course ID and Student ID are required' });
        return;
      }
      
      // Check if course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      // Check if student exists and has student role
      const student = await userModel.findById(studentId);
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      if (student.role !== UserRole.STUDENT) {
        res.status(400).json({ error: 'User is not a student' });
        return;
      }
      
      // Check if student is already enrolled
      const isEnrolled = await enrollmentModel.isEnrolled(courseId, studentId);
      if (isEnrolled) {
        res.status(400).json({ error: 'Student is already enrolled in this course' });
        return;
      }
      
      // Create enrollment
      const enrollmentData: EnrollmentInput = {
        courseId,
        studentId,
        status: EnrollmentStatus.ACTIVE
      };
      
      const enrollment = await enrollmentModel.create(enrollmentData);
      if (!enrollment) {
        res.status(500).json({ error: 'Failed to create enrollment' });
        return;
      }
      
      res.status(201).json(enrollment);
    } catch (error) {
      logger.error('Error in enroll:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all enrollments for a course
   */
  async getCourseEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      
      // Validate input
      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }
      
      // Check if course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      // Get enrollments
      const enrollments = await enrollmentModel.findByCourseId(courseId);
      
      res.status(200).json(enrollments);
    } catch (error) {
      logger.error('Error in getCourseEnrollments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all enrollments for a student
   */
  async getStudentEnrollments(req: Request, res: Response): Promise<void> {
    try {
      // Get studentId from params or from authenticated user
      const studentId = req.params.studentId || req.user?.userId;
      
      if (!studentId) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
      }
      
      // Check if student exists
      const student = await userModel.findById(studentId);
      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }
      
      // Check permissions - only admins, teachers, or the student themselves can view enrollments
      if (req.user?.role !== UserRole.ADMINISTRATOR && req.user?.role !== UserRole.TEACHER && req.user?.userId !== studentId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // Get enrollments with course details
      const enrollments = await enrollmentModel.findByStudentId(studentId);
      
      res.status(200).json(enrollments);
    } catch (error) {
      logger.error('Error in getStudentEnrollments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get enrollment details
   */
  async getEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({ error: 'Enrollment ID is required' });
        return;
      }
      
      // Get enrollment with details
      const enrollment = await enrollmentModel.findById(id, true);
      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }
      
      // Check permissions - only admins, teachers, or the enrolled student can view enrollment details
      if (
        req.user?.role !== UserRole.ADMINISTRATOR && 
        req.user?.role !== UserRole.TEACHER && 
        req.user?.userId !== enrollment.studentId
      ) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      res.status(200).json(enrollment);
    } catch (error) {
      logger.error('Error in getEnrollment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Update enrollment status or grade
   */
  async updateEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, grade, completedAt } = req.body;
      
      // Validate input
      if (!id) {
        res.status(400).json({ error: 'Enrollment ID is required' });
        return;
      }
      
      // Get enrollment
      const enrollment = await enrollmentModel.findById(id);
      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }
      
      // Check permissions - only admins and teachers can update enrollments
      if (req.user?.role !== UserRole.ADMINISTRATOR && req.user?.role !== UserRole.TEACHER) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // For teachers, check if they are teaching the course
      if (req.user?.role === UserRole.TEACHER) {
        const course = await courseModel.findById(enrollment.courseId);
        if (!course || course.teacherId !== req.user.userId) {
          res.status(403).json({ error: 'You can only update enrollments for courses you teach' });
          return;
        }
      }
      
      // Update enrollment
      const updatedEnrollment = await enrollmentModel.update(id, { status, grade, completedAt });
      if (!updatedEnrollment) {
        res.status(500).json({ error: 'Failed to update enrollment' });
        return;
      }
      
      res.status(200).json(updatedEnrollment);
    } catch (error) {
      logger.error('Error in updateEnrollment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Drop a student from a course
   */
  async dropEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({ error: 'Enrollment ID is required' });
        return;
      }
      
      // Get enrollment
      const enrollment = await enrollmentModel.findById(id);
      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }
      
      // Check permissions
      // Students can drop their own enrollments
      // Admins can drop any enrollment
      // Teachers can drop students from their courses
      if (req.user?.role === UserRole.STUDENT && req.user.userId !== enrollment.studentId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      if (req.user?.role === UserRole.TEACHER) {
        const course = await courseModel.findById(enrollment.courseId);
        if (!course || course.teacherId !== req.user.userId) {
          res.status(403).json({ error: 'You can only drop students from courses you teach' });
          return;
        }
      }
      
      // Update enrollment status to DROPPED
      const updatedEnrollment = await enrollmentModel.update(id, { status: EnrollmentStatus.DROPPED });
      if (!updatedEnrollment) {
        res.status(500).json({ error: 'Failed to drop enrollment' });
        return;
      }
      
      res.status(200).json(updatedEnrollment);
    } catch (error) {
      logger.error('Error in dropEnrollment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Delete enrollment (admin only)
   */
  async deleteEnrollment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Validate input
      if (!id) {
        res.status(400).json({ error: 'Enrollment ID is required' });
        return;
      }
      
      // Check permissions - only admins can delete enrollments
      if (req.user?.role !== UserRole.ADMINISTRATOR) {
        res.status(403).json({ error: 'Forbidden - Only administrators can delete enrollments' });
        return;
      }
      
      // Delete enrollment
      const success = await enrollmentModel.delete(id);
      if (!success) {
        res.status(500).json({ error: 'Failed to delete enrollment' });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      logger.error('Error in deleteEnrollment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get enrollment count for a course
   */
  async getEnrollmentCount(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      
      // Validate input
      if (!courseId) {
        res.status(400).json({ error: 'Course ID is required' });
        return;
      }
      
      // Check if course exists
      const course = await courseModel.findById(courseId);
      if (!course) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }
      
      // Get enrollment count
      const count = await enrollmentModel.getEnrollmentCount(courseId);
      
      res.status(200).json({ count });
    } catch (error) {
      logger.error('Error in getEnrollmentCount:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const enrollmentController = new EnrollmentController(); 