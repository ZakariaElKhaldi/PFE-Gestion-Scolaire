import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped'
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
  grade?: string;
  enrolledAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollmentInput {
  courseId: string;
  studentId: string;
  status?: EnrollmentStatus;
  grade?: string;
  completedAt?: string;
}

export interface EnrollmentWithDetails extends Enrollment {
  course?: {
    id: string;
    name: string;
    code: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

class EnrollmentModel {
  /**
   * Find enrollment by id
   */
  async findById(id: string, includeDetails = false): Promise<Enrollment | EnrollmentWithDetails | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error('Error finding enrollment by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      const enrollment: Enrollment = {
        id: data.id,
        courseId: data.course_id,
        studentId: data.student_id,
        status: data.status as EnrollmentStatus,
        grade: data.grade,
        enrolledAt: new Date(data.enrolled_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // If details are not requested, return the basic enrollment
      if (!includeDetails) {
        return enrollment;
      }
      
      // Get course details
      let course;
      const { data: courseData, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('id, name, code')
        .eq('id', data.course_id)
        .single();
      
      if (!courseError && courseData) {
        course = {
          id: courseData.id,
          name: courseData.name,
          code: courseData.code
        };
      }
      
      // Get student details
      let student;
      const { data: studentData, error: studentError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('id', data.student_id)
        .single();
      
      if (!studentError && studentData) {
        student = {
          id: studentData.id,
          firstName: studentData.first_name,
          lastName: studentData.last_name,
          email: studentData.email
        };
      }
      
      return {
        ...enrollment,
        course,
        student
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Find enrollments by course id
   */
  async findByCourseId(courseId: string): Promise<Enrollment[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId);
      
      if (error) {
        logger.error('Error finding enrollments by course id:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        courseId: item.course_id,
        studentId: item.student_id,
        status: item.status as EnrollmentStatus,
        grade: item.grade,
        enrolledAt: new Date(item.enrolled_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findByCourseId:', error);
      return [];
    }
  }

  /**
   * Find enrollments by student id
   */
  async findByStudentId(studentId: string): Promise<EnrollmentWithDetails[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('*')
        .eq('student_id', studentId);
      
      if (error) {
        logger.error('Error finding enrollments by student id:', error);
        return [];
      }
      
      const enrollments = data.map(item => ({
        id: item.id,
        courseId: item.course_id,
        studentId: item.student_id,
        status: item.status as EnrollmentStatus,
        grade: item.grade,
        enrolledAt: new Date(item.enrolled_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
      
      // Get course details for each enrollment
      const enrollmentsWithDetails: EnrollmentWithDetails[] = [];
      
      for (const enrollment of enrollments) {
        const { data: courseData, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('id, name, code')
          .eq('id', enrollment.courseId)
          .single();
        
        if (!courseError && courseData) {
          enrollmentsWithDetails.push({
            ...enrollment,
            course: {
              id: courseData.id,
              name: courseData.name,
              code: courseData.code
            }
          });
        } else {
          enrollmentsWithDetails.push(enrollment);
        }
      }
      
      return enrollmentsWithDetails;
    } catch (error) {
      logger.error('Error in findByStudentId:', error);
      return [];
    }
  }

  /**
   * Check if a student is already enrolled in a course
   */
  async isEnrolled(courseId: string, studentId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .eq('student_id', studentId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        logger.error('Error checking enrollment:', error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      logger.error('Error in isEnrolled:', error);
      return false;
    }
  }

  /**
   * Create a new enrollment
   */
  async create(enrollmentData: EnrollmentInput): Promise<Enrollment | null> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .insert({
          id,
          course_id: enrollmentData.courseId,
          student_id: enrollmentData.studentId,
          status: enrollmentData.status || EnrollmentStatus.ACTIVE,
          grade: enrollmentData.grade || null,
          enrolled_at: now,
          completed_at: enrollmentData.completedAt || null,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating enrollment:', error);
        return null;
      }
      
      return {
        id: data.id,
        courseId: data.course_id,
        studentId: data.student_id,
        status: data.status as EnrollmentStatus,
        grade: data.grade,
        enrolledAt: new Date(data.enrolled_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in create:', error);
      return null;
    }
  }

  /**
   * Update enrollment
   */
  async update(id: string, enrollmentData: Partial<EnrollmentInput>): Promise<Enrollment | null> {
    try {
      // Convert camelCase to snake_case for database
      const dbData: Record<string, any> = {};
      
      if (enrollmentData.status !== undefined) dbData.status = enrollmentData.status;
      if (enrollmentData.grade !== undefined) dbData.grade = enrollmentData.grade;
      if (enrollmentData.completedAt !== undefined) dbData.completed_at = enrollmentData.completedAt;
      
      // Add updated_at timestamp
      dbData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('course_enrollments')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating enrollment:', error);
        return null;
      }
      
      return {
        id: data.id,
        courseId: data.course_id,
        studentId: data.student_id,
        status: data.status as EnrollmentStatus,
        grade: data.grade,
        enrolledAt: new Date(data.enrolled_at),
        completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in update:', error);
      return null;
    }
  }

  /**
   * Delete enrollment
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('course_enrollments')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting enrollment:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      return false;
    }
  }

  /**
   * Get enrollment count for a course
   */
  async getEnrollmentCount(courseId: string): Promise<number> {
    try {
      const { count, error } = await supabaseAdmin
        .from('course_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('status', EnrollmentStatus.ACTIVE);
      
      if (error) {
        logger.error('Error getting enrollment count:', error);
        return 0;
      }
      
      return count || 0;
    } catch (error) {
      logger.error('Error in getEnrollmentCount:', error);
      return 0;
    }
  }
}

export const enrollmentModel = new EnrollmentModel(); 