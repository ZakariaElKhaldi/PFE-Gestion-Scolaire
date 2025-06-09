import { supabaseAdmin } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { config } from '../config/config';

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate?: Date;
  fileUrl?: string;
  verificationCode: string;
  status: CertificateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum CertificateStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export interface CertificateWithDetails extends Certificate {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course?: {
    id: string;
    name: string;
    code: string;
  };
}

class CertificateModel {
  /**
   * Find certificate by id
   */
  async findById(id: string, includeDetails = false): Promise<Certificate | CertificateWithDetails | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error('Error finding certificate by id:', error);
        return null;
      }
      
      if (!data) return null;
      
      const certificate: Certificate = {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        certificateNumber: data.certificate_number,
        issueDate: new Date(data.issue_date),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        fileUrl: data.file_url,
        verificationCode: data.verification_code,
        status: data.status as CertificateStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // If details are not requested, return the basic certificate
      if (!includeDetails) {
        return certificate;
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
      
      return {
        ...certificate,
        student,
        course
      };
    } catch (error) {
      logger.error('Error in findById:', error);
      return null;
    }
  }

  /**
   * Find certificate by verification code
   */
  async findByVerificationCode(verificationCode: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('verification_code', verificationCode)
        .single();
      
      if (error) {
        logger.error('Error finding certificate by verification code:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        certificateNumber: data.certificate_number,
        issueDate: new Date(data.issue_date),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        fileUrl: data.file_url,
        verificationCode: data.verification_code,
        status: data.status as CertificateStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in findByVerificationCode:', error);
      return null;
    }
  }

  /**
   * Find certificates by student id
   */
  async findByStudentId(studentId: string): Promise<Certificate[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('student_id', studentId)
        .order('issue_date', { ascending: false });
      
      if (error) {
        logger.error('Error finding certificates by student id:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        courseId: item.course_id,
        enrollmentId: item.enrollment_id,
        certificateNumber: item.certificate_number,
        issueDate: new Date(item.issue_date),
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        fileUrl: item.file_url,
        verificationCode: item.verification_code,
        status: item.status as CertificateStatus,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findByStudentId:', error);
      return [];
    }
  }

  /**
   * Find certificates by course id
   */
  async findByCourseId(courseId: string): Promise<Certificate[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select('*')
        .eq('course_id', courseId)
        .order('issue_date', { ascending: false });
      
      if (error) {
        logger.error('Error finding certificates by course id:', error);
        return [];
      }
      
      return data.map(item => ({
        id: item.id,
        studentId: item.student_id,
        courseId: item.course_id,
        enrollmentId: item.enrollment_id,
        certificateNumber: item.certificate_number,
        issueDate: new Date(item.issue_date),
        expiryDate: item.expiry_date ? new Date(item.expiry_date) : undefined,
        fileUrl: item.file_url,
        verificationCode: item.verification_code,
        status: item.status as CertificateStatus,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      logger.error('Error in findByCourseId:', error);
      return [];
    }
  }

  /**
   * Check if a certificate already exists for this enrollment
   */
  async existsForEnrollment(enrollmentId: string): Promise<boolean> {
    try {
      const { count, error } = await supabaseAdmin
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('enrollment_id', enrollmentId);
      
      if (error) {
        logger.error('Error checking if certificate exists:', error);
        return false;
      }
      
      return (count || 0) > 0;
    } catch (error) {
      logger.error('Error in existsForEnrollment:', error);
      return false;
    }
  }

  /**
   * Generate a new certificate
   */
  async generate(
    studentId: string,
    courseId: string,
    enrollmentId: string,
    fileUrl?: string
  ): Promise<Certificate | null> {
    try {
      // Check if certificate already exists for this enrollment
      const exists = await this.existsForEnrollment(enrollmentId);
      if (exists) {
        logger.error('Certificate already exists for this enrollment');
        return null;
      }
      
      const id = uuidv4();
      const now = new Date();
      const certificateNumber = `CERT-${now.getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const verificationCode = uuidv4().substring(0, 8).toUpperCase();
      
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .insert({
          id,
          student_id: studentId,
          course_id: courseId,
          enrollment_id: enrollmentId,
          certificate_number: certificateNumber,
          issue_date: now.toISOString(),
          file_url: fileUrl || null,
          verification_code: verificationCode,
          status: CertificateStatus.ACTIVE,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single();
      
      if (error) {
        logger.error('Error generating certificate:', error);
        return null;
      }
      
      return {
        id: data.id,
        studentId: data.student_id,
        courseId: data.course_id,
        enrollmentId: data.enrollment_id,
        certificateNumber: data.certificate_number,
        issueDate: new Date(data.issue_date),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        fileUrl: data.file_url,
        verificationCode: data.verification_code,
        status: data.status as CertificateStatus,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      logger.error('Error in generate:', error);
      return null;
    }
  }

  /**
   * Update certificate file URL
   */
  async updateFileUrl(id: string, fileUrl: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('certificates')
        .update({
          file_url: fileUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        logger.error('Error updating certificate file URL:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in updateFileUrl:', error);
      return false;
    }
  }

  /**
   * Revoke certificate
   */
  async revoke(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('certificates')
        .update({
          status: CertificateStatus.REVOKED,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        logger.error('Error revoking certificate:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error in revoke:', error);
      return false;
    }
  }
}

export const certificateModel = new CertificateModel(); 