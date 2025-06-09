import { Request, Response } from 'express';
import { certificateModel, CertificateStatus } from '../models/certificate.model';
import { enrollmentModel, EnrollmentStatus } from '../models/enrollment.model';
import { courseModel } from '../models/course.model';
import { userModel } from '../models/user.model';
import { supabaseAdmin } from '../config/supabase';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { UserRole } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';

export class CertificateController {
  /**
   * Generate a certificate for a completed course enrollment
   */
  async generateCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { enrollmentId } = req.body;
      
      if (!enrollmentId) {
        res.status(400).json({ error: 'Enrollment ID is required' });
        return;
      }
      
      // Get enrollment details
      const enrollment = await enrollmentModel.findById(enrollmentId, true);
      if (!enrollment) {
        res.status(404).json({ error: 'Enrollment not found' });
        return;
      }
      
      // Check if enrollment is completed
      if (enrollment.status !== EnrollmentStatus.COMPLETED) {
        res.status(400).json({ error: 'Enrollment is not completed' });
        return;
      }
      
      // Check if certificate already exists
      const exists = await certificateModel.existsForEnrollment(enrollmentId);
      if (exists) {
        res.status(400).json({ error: 'Certificate already exists for this enrollment' });
        return;
      }
      
      // Generate certificate
      const certificate = await certificateModel.generate(
        enrollment.studentId,
        enrollment.courseId,
        enrollmentId
      );
      
      if (!certificate) {
        res.status(500).json({ error: 'Failed to generate certificate' });
        return;
      }
      
      // Generate QR code for verification URL
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificate.verificationCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      
      // Return the certificate with QR code
      res.status(201).json({
        ...certificate,
        qrCode: qrCodeDataUrl,
        verificationUrl
      });
    } catch (error) {
      logger.error('Error in generateCertificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Upload certificate file
   */
  async uploadCertificateFile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file;
      
      if (!id) {
        res.status(400).json({ error: 'Certificate ID is required' });
        return;
      }
      
      if (!file) {
        res.status(400).json({ error: 'Certificate file is required' });
        return;
      }
      
      // Get certificate
      const certificate = await certificateModel.findById(id);
      if (!certificate) {
        res.status(404).json({ error: 'Certificate not found' });
        return;
      }
      
      // Upload file to Supabase Storage
      const fileExt = path.extname(file.originalname);
      const fileName = `${certificate.certificateNumber}${fileExt}`;
      const filePath = `${certificate.studentId}/${fileName}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from(config.storage.certificatesBucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });
      
      if (error) {
        logger.error('Error uploading certificate file:', error);
        res.status(500).json({ error: 'Failed to upload certificate file' });
        return;
      }
      
      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from(config.storage.certificatesBucket)
        .getPublicUrl(filePath);
      
      // Update certificate with file URL
      const success = await certificateModel.updateFileUrl(id, urlData.publicUrl);
      if (!success) {
        res.status(500).json({ error: 'Failed to update certificate file URL' });
        return;
      }
      
      res.status(200).json({ fileUrl: urlData.publicUrl });
    } catch (error) {
      logger.error('Error in uploadCertificateFile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Certificate ID is required' });
        return;
      }
      
      // Get certificate with details
      const certificate = await certificateModel.findById(id, true);
      if (!certificate) {
        res.status(404).json({ error: 'Certificate not found' });
        return;
      }
      
      // Check permissions - only admins, teachers, or the certificate owner can view it
      if (
        req.user?.role !== UserRole.ADMINISTRATOR &&
        req.user?.role !== UserRole.TEACHER &&
        req.user?.userId !== certificate.studentId
      ) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // Generate QR code for verification URL
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/certificates/verify/${certificate.verificationCode}`;
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      
      res.status(200).json({
        ...certificate,
        qrCode: qrCodeDataUrl,
        verificationUrl
      });
    } catch (error) {
      logger.error('Error in getCertificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all certificates for a student
   */
  async getStudentCertificates(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId || req.user?.userId;
      
      if (!studentId) {
        res.status(400).json({ error: 'Student ID is required' });
        return;
      }
      
      // Check permissions - only admins or the student themselves can view their certificates
      if (req.user?.role !== UserRole.ADMINISTRATOR && req.user?.userId !== studentId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // Get certificates
      const certificates = await certificateModel.findByStudentId(studentId);
      
      res.status(200).json(certificates);
    } catch (error) {
      logger.error('Error in getStudentCertificates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get all certificates for a course
   */
  async getCourseCertificates(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      
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
      
      // Check permissions - only admins or the course teacher can view course certificates
      if (
        req.user?.role !== UserRole.ADMINISTRATOR &&
        (req.user?.role !== UserRole.TEACHER || req.user?.userId !== course.teacherId)
      ) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      
      // Get certificates
      const certificates = await certificateModel.findByCourseId(courseId);
      
      res.status(200).json(certificates);
    } catch (error) {
      logger.error('Error in getCourseCertificates:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Verify certificate by verification code
   */
  async verifyCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      
      if (!code) {
        res.status(400).json({ error: 'Verification code is required' });
        return;
      }
      
      // Get certificate
      const certificate = await certificateModel.findByVerificationCode(code);
      if (!certificate) {
        res.status(404).json({ error: 'Certificate not found' });
        return;
      }
      
      // Check if certificate is active
      if (certificate.status !== CertificateStatus.ACTIVE) {
        res.status(400).json({ 
          error: 'Certificate is not valid',
          status: certificate.status
        });
        return;
      }
      
      // Check if certificate has expired
      if (certificate.expiryDate && new Date() > certificate.expiryDate) {
        res.status(400).json({ 
          error: 'Certificate has expired',
          expiryDate: certificate.expiryDate
        });
        return;
      }
      
      // Get student and course details
      const student = await userModel.findById(certificate.studentId);
      const course = await courseModel.findById(certificate.courseId);
      
      if (!student || !course) {
        res.status(404).json({ error: 'Student or course not found' });
        return;
      }
      
      // Return certificate verification details
      res.status(200).json({
        isValid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          issueDate: certificate.issueDate,
          expiryDate: certificate.expiryDate
        },
        student: {
          firstName: student.firstName,
          lastName: student.lastName
        },
        course: {
          name: course.name,
          code: course.code
        }
      });
    } catch (error) {
      logger.error('Error in verifyCertificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Revoke certificate (admin only)
   */
  async revokeCertificate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ error: 'Certificate ID is required' });
        return;
      }
      
      // Get certificate
      const certificate = await certificateModel.findById(id);
      if (!certificate) {
        res.status(404).json({ error: 'Certificate not found' });
        return;
      }
      
      // Revoke certificate
      const success = await certificateModel.revoke(id);
      if (!success) {
        res.status(500).json({ error: 'Failed to revoke certificate' });
        return;
      }
      
      res.status(200).json({ message: 'Certificate revoked successfully' });
    } catch (error) {
      logger.error('Error in revokeCertificate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const certificateController = new CertificateController(); 