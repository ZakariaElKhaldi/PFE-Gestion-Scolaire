import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export enum CourseStatus {
  ACTIVE = 'active',
  UPCOMING = 'upcoming',
  COMPLETED = 'completed'
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  price?: number;
  departmentId?: string;
  teacherId?: string;
  startDate?: Date;
  endDate?: Date;
  maxStudents: number;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseInput {
  name: string;
  code: string;
  description?: string;
  credits?: number;
  price?: number;
  departmentId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  status?: CourseStatus;
}

export interface CourseWithDetails extends Course {
  department?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

class CourseModel {
  /**
   * Find course by id
   */
  async findById(id: string, includeDetails = false): Promise<Course | CourseWithDetails | null> {
    try {
      let query = supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      const { data, error } = await query;
      
      if (error) {
        logger.error('Error finding course by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      const course: Course = {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        credits: data.credits,
        price: data.price,
        departmentId: data.department_id,
        teacherId: data.teacher_id,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        maxStudents: data.max_students,
        status: data.status as CourseStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // If details are not requested, return the basic course
      if (!includeDetails) {
        return course;
      }
      
      // Get department details if departmentId exists
      let department;
      if (data.department_id) {
        const { data: deptData, error: deptError } = await supabaseAdmin
          .from('departments')
          .select('id, name')
          .eq('id', data.department_id)
          .single();
        
        if (!deptError && deptData) {
          department = {
            id: deptData.id,
            name: deptData.name
          };
        }
      }
      
      // Get teacher details if teacherId exists
      let teacher;
      if (data.teacher_id) {
        const { data: teacherData, error: teacherError } = await supabaseAdmin
          .from('users')
          .select('id, first_name, last_name')
          .eq('id', data.teacher_id)
          .single();
        
        if (!teacherError && teacherData) {
          teacher = {
            id: teacherData.id,
            firstName: teacherData.first_name,
            lastName: teacherData.last_name
          };
        }
      }
      
      return {
        ...course,
        department,
        teacher
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Find all courses with optional filters
   */
  async findAll(filters?: {
    departmentId?: string;
    teacherId?: string;
    status?: CourseStatus;
  }): Promise<Course[]> {
    try {
      let query = supabaseAdmin.from('courses').select('*');
      
      // Apply filters if provided
      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      
      if (filters?.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      // Order by name
      query = query.order('name');
      
      const { data, error } = await query;
      
      if (error) {
        logger.error('Error finding all courses:', error);
        return [];
      }
      
      return data.map(course => ({
        id: course.id,
        name: course.name,
        code: course.code,
        description: course.description,
        credits: course.credits,
        price: course.price,
        departmentId: course.department_id,
        teacherId: course.teacher_id,
        startDate: course.start_date ? new Date(course.start_date) : undefined,
        endDate: course.end_date ? new Date(course.end_date) : undefined,
        maxStudents: course.max_students,
        status: course.status as CourseStatus,
        createdAt: new Date(course.created_at),
        updatedAt: new Date(course.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findAll:', error);
      return [];
    }
  }

  /**
   * Create a new course
   */
  async create(courseData: CourseInput): Promise<Course | null> {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('courses')
        .insert({
          id,
          name: courseData.name,
          code: courseData.code,
          description: courseData.description || null,
          credits: courseData.credits || 1,
          price: courseData.price || null,
          department_id: courseData.departmentId || null,
          teacher_id: courseData.teacherId || null,
          start_date: courseData.startDate || null,
          end_date: courseData.endDate || null,
          max_students: courseData.maxStudents || 30,
          status: courseData.status || CourseStatus.UPCOMING,
          created_at: now,
          updated_at: now
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error creating course:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        credits: data.credits,
        price: data.price,
        departmentId: data.department_id,
        teacherId: data.teacher_id,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        maxStudents: data.max_students,
        status: data.status as CourseStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in create:', error);
      return null;
    }
  }

  /**
   * Update course
   */
  async update(id: string, courseData: Partial<CourseInput>): Promise<Course | null> {
    try {
      // Convert camelCase to snake_case for database
      const dbData: Record<string, any> = {};
      
      if (courseData.name !== undefined) dbData.name = courseData.name;
      if (courseData.code !== undefined) dbData.code = courseData.code;
      if (courseData.description !== undefined) dbData.description = courseData.description;
      if (courseData.credits !== undefined) dbData.credits = courseData.credits;
      if (courseData.price !== undefined) dbData.price = courseData.price;
      if (courseData.departmentId !== undefined) dbData.department_id = courseData.departmentId;
      if (courseData.teacherId !== undefined) dbData.teacher_id = courseData.teacherId;
      if (courseData.startDate !== undefined) dbData.start_date = courseData.startDate;
      if (courseData.endDate !== undefined) dbData.end_date = courseData.endDate;
      if (courseData.maxStudents !== undefined) dbData.max_students = courseData.maxStudents;
      if (courseData.status !== undefined) dbData.status = courseData.status;
      
      // Add updated_at timestamp
      dbData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('courses')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error('Error updating course:', error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        code: data.code,
        description: data.description,
        credits: data.credits,
        price: data.price,
        departmentId: data.department_id,
        teacherId: data.teacher_id,
        startDate: data.start_date ? new Date(data.start_date) : undefined,
        endDate: data.end_date ? new Date(data.end_date) : undefined,
        maxStudents: data.max_students,
        status: data.status as CourseStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in update:', error);
      return null;
    }
  }

  /**
   * Delete course
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error('Error deleting course:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in delete:', error);
      return false;
    }
  }
}

export const courseModel = new CourseModel(); 