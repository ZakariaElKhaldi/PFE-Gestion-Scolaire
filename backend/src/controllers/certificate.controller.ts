import { Request, Response } from 'express';
import { certificateModel, CreateCertificateDTO, UpdateCertificateDTO } from '../models/certificate.model';
import { asyncHandler } from '../middlewares/error.middleware';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { userModel } from '../models/user.model';
import { courseModel } from '../models/course.model';
import QRCode from 'qrcode';

export class CertificateController {
  /**
   * Get all certificates for the current student
   */
  getStudentCertificates = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user?.userId as string;
    
    const certificates = await certificateModel.findByStudentId(studentId);
    
    res.status(200).json({
      error: false,
      data: { certificates },
      message: 'Certificates retrieved successfully'
    });
  });

  /**
   * Get all certificates for a specific student (admin only)
   */
  getStudentCertificatesById = asyncHandler(async (req: Request, res: Response) => {
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({
        error: true,
        message: 'Student ID is required'
      });
    }
    
    // Check if the student exists
    const student = await userModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        error: true,
        message: 'Student not found'
      });
    }
    
    const certificates = await certificateModel.findByStudentId(studentId);
    
    res.status(200).json({
      error: false,
      data: { certificates },
      message: 'Certificates retrieved successfully'
    });
  });

  /**
   * Get a certificate
   */
  getCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const studentId = req.user?.userId as string;
    
    if (!id) {
      return res.status(400).json({
        error: true,
        message: 'Certificate ID is required'
      });
    }
    
    const certificate = await certificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }
    
    // Check if the certificate belongs to the requesting student
    if (req.user?.role === 'student' && certificate.studentId !== studentId) {
      return res.status(403).json({
        error: true,
        message: 'Access denied: This certificate does not belong to you'
      });
    }
    
    res.status(200).json({
      error: false,
      data: { certificate },
      message: 'Certificate retrieved successfully'
    });
  });

  /**
   * Create a new certificate (admin only)
   */
  createCertificate = asyncHandler(async (req: Request, res: Response) => {
    const certificateData: CreateCertificateDTO = req.body;
    
    // Validate that the student exists
    const student = await userModel.findById(certificateData.studentId);
    if (!student) {
      return res.status(404).json({
        error: true,
        message: 'Student not found'
      });
    }
    
    const certificateId = await certificateModel.create(certificateData);
    
    // Generate the PDF certificate if needed
    if (req.body.generatePdf) {
      const certificate = await certificateModel.findById(certificateId);
      if (certificate) {
        await this.generateCertificatePdf(certificate);
      }
    }
    
    const newCertificate = await certificateModel.findById(certificateId);
    
    res.status(201).json({
      error: false,
      data: { certificate: newCertificate },
      message: 'Certificate created successfully'
    });
  });

  /**
   * Update a certificate (admin only)
   */
  updateCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const certificateData: UpdateCertificateDTO = req.body;
    
    const certificate = await certificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }
    
    const updated = await certificateModel.update(id, certificateData);
    
    if (!updated) {
      return res.status(400).json({
        error: true,
        message: 'Failed to update certificate'
      });
    }
    
    // Regenerate the PDF if needed
    if (req.body.regeneratePdf) {
      const updatedCertificate = await certificateModel.findById(id);
      if (updatedCertificate) {
        await this.generateCertificatePdf(updatedCertificate);
      }
    }
    
    const updatedCertificate = await certificateModel.findById(id);
    
    res.status(200).json({
      error: false,
      data: { certificate: updatedCertificate },
      message: 'Certificate updated successfully'
    });
  });

  /**
   * Delete a certificate (admin only)
   */
  deleteCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const certificate = await certificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }
    
    // Delete the PDF file if it exists
    if (certificate.downloadUrl) {
      const filePath = path.join(__dirname, '../../public', certificate.downloadUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    const deleted = await certificateModel.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        error: true,
        message: 'Failed to delete certificate'
      });
    }
    
    res.status(200).json({
      error: false,
      message: 'Certificate deleted successfully'
    });
  });

  /**
   * Verify a certificate by verification ID
   */
  verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { verificationId } = req.params;
    
    if (!verificationId) {
      return res.status(400).json({
        error: true,
        message: 'Verification ID is required'
      });
    }
    
    const verification = await certificateModel.verifyStatus(verificationId);
    
    res.status(200).json({
      error: !verification.isValid,
      data: {
        isValid: verification.isValid,
        certificate: verification.certificate
      },
      message: verification.message
    });
  });

  /**
   * Generate a course completion certificate for a student
   */
  generateCourseCompletionCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { studentId, courseId } = req.body;
    
    if (!studentId || !courseId) {
      return res.status(400).json({
        error: true,
        message: 'Student ID and Course ID are required'
      });
    }
    
    // Check if the student exists
    const student = await userModel.findById(studentId);
    if (!student) {
      return res.status(404).json({
        error: true,
        message: 'Student not found'
      });
    }
    
    // Check if the course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        error: true,
        message: 'Course not found'
      });
    }
    
    // Check if the student is enrolled in the course
    // This assumes the existence of a courseEnrollmentModel with a findByCourseAndStudent method
    // const enrollment = await courseEnrollmentModel.findByCourseAndStudent(courseId, studentId);
    // if (!enrollment) {
    //   return res.status(400).json({
    //     error: true,
    //     message: 'Student is not enrolled in this course'
    //   });
    // }
    
    // Create the certificate
    const certificateData: CreateCertificateDTO = {
      studentId,
      title: `${course.title || 'Course'} - Course Completion Certificate`,
      issueDate: new Date(),
      issuer: course.title || 'Course',
      type: 'Academic',
      description: `This certifies that ${student.firstName} ${student.lastName} has successfully completed the ${course.title || 'Course'} course.`,
      skills: req.body.skills || []
    };
    
    const certificateId = await certificateModel.create(certificateData);
    
    // Generate the PDF certificate
    const certificate = await certificateModel.findById(certificateId);
    if (certificate) {
      await this.generateCertificatePdf(certificate);
    }
    
    const newCertificate = await certificateModel.findById(certificateId);
    
    res.status(201).json({
      error: false,
      data: { certificate: newCertificate },
      message: 'Course completion certificate generated successfully'
    });
  });

  /**
   * Download a certificate
   */
  downloadCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;
    
    const certificate = await certificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }
    
    // Check if the user is authorized to download this certificate
    if (certificate.studentId !== userId && userRole !== 'administrator') {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to download this certificate'
      });
    }
    
    // Check if the certificate has a download URL
    if (!certificate.downloadUrl) {
      // Generate the PDF now
      await this.generateCertificatePdf(certificate);
      
      // Reload the certificate to get the downloadUrl
      const updatedCertificate = await certificateModel.findById(id);
      if (!updatedCertificate || !updatedCertificate.downloadUrl) {
        return res.status(500).json({
          error: true,
          message: 'Failed to generate certificate PDF'
        });
      }
      
      certificate.downloadUrl = updatedCertificate.downloadUrl;
    }
    
    // Send the file
    const filePath = path.join(__dirname, '../../public', certificate.downloadUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: true,
        message: 'Certificate file not found'
      });
    }
    
    res.download(filePath, `certificate_${certificate.verificationId}.pdf`);
  });

  /**
   * Public download endpoint for certificates (no authentication required)
   */
  publicDownloadCertificate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const certificate = await certificateModel.findById(id);
    
    if (!certificate) {
      return res.status(404).json({
        error: true,
        message: 'Certificate not found'
      });
    }
    
    // Check if the certificate has a download URL
    if (!certificate.downloadUrl) {
      // Generate the PDF now
      await this.generateCertificatePdf(certificate);
      
      // Reload the certificate to get the downloadUrl
      const updatedCertificate = await certificateModel.findById(id);
      if (!updatedCertificate || !updatedCertificate.downloadUrl) {
        return res.status(500).json({
          error: true,
          message: 'Failed to generate certificate PDF'
        });
      }
      
      certificate.downloadUrl = updatedCertificate.downloadUrl;
    }
    
    // Send the file
    const filePath = path.join(__dirname, '../../public', certificate.downloadUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: true,
        message: 'Certificate file not found'
      });
    }
    
    res.download(filePath, `certificate_${certificate.verificationId}.pdf`);
  });

  /**
   * Utility method to generate a QR code for certificate verification
   */
  private async generateQRCode(verificationId: string): Promise<string> {
    // Create directories if they don't exist
    const qrCodesDir = path.join(__dirname, '../../public/certificates/qrcodes');
    if (!fs.existsSync(qrCodesDir)) {
      fs.mkdirSync(qrCodesDir, { recursive: true });
    }
    
    // Generate a filename for the QR code
    const filename = `qr-${verificationId.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    const filePath = path.join(qrCodesDir, filename);
    const qrCodeUrl = `/certificates/qrcodes/${filename}`;
    
    // The verification URL that will be encoded in the QR code
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${verificationId}`;
    
    try {
      // Generate the QR code
      await QRCode.toFile(filePath, verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Utility method to generate a PDF certificate
   */
  private async generateCertificatePdf(certificate: any): Promise<string> {
    try {
      // Create directories if they don't exist
      const certificatesDir = path.join(__dirname, '../../public/certificates/pdf');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }
      
      // Generate a filename
      const filename = `${certificate.id}.pdf`;
      const filePath = path.join(certificatesDir, filename);
      const downloadUrl = `/certificates/pdf/${filename}`;
      
      // Get the QR code path
      const qrCodePath = path.join(__dirname, '../../public/certificates/qr', `${certificate.id}.png`);
      
      // Create a PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });
      
      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(filePath));
      
      // Add content to the PDF
      doc.font('Helvetica-Bold').fontSize(30).text('Certificate of Achievement', { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica').fontSize(18).text(`This is to certify that`, { align: 'center' });
      doc.moveDown();
      
      // Get the student's name
      const student = await userModel.findById(certificate.studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : certificate.studentId;
      
      doc.font('Helvetica-Bold').fontSize(24).text(studentName, { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica').fontSize(18).text(`has successfully completed`, { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica-Bold').fontSize(22).text(certificate.title, { align: 'center' });
      doc.moveDown();
      
      // Add description if available, otherwise use a default
      const description = certificate.description || `Awarded for excellence in ${certificate.type}`;
      doc.font('Helvetica').fontSize(16).text(description, { align: 'center' });
      doc.moveDown(2);
      
      // Add issuer
      doc.fontSize(16).text(`Issued by: ${certificate.issuer}`, { align: 'center' });
      doc.moveDown();
      
      // Add issue date
      const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.fontSize(14).text(`Issue Date: ${issueDate}`, { align: 'left' });
      
      // Add expiry date if applicable
      if (certificate.expiryDate) {
        const expiryDate = new Date(certificate.expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        doc.text(`Expiry Date: ${expiryDate}`, { align: 'left' });
      }
      
      // Add verification ID
      doc.text(`Verification ID: ${certificate.verificationId}`, { align: 'left' });
      
      // Add metadata if available
      if (certificate.metadata) {
        let metadata;
        try {
          metadata = typeof certificate.metadata === 'string' ? 
            JSON.parse(certificate.metadata) : certificate.metadata;
            
          if (metadata) {
            doc.moveDown();
            doc.text('Additional Information:', { align: 'left' });
            doc.moveDown(0.5);
            
            Object.entries(metadata).forEach(([key, value]) => {
              // Skip complex objects or arrays
              if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                doc.text(`• ${key}: ${value}`, { align: 'left', indent: 20 });
              }
            });
          }
        } catch (e) {
          console.error('Error parsing metadata:', e);
        }
      }
      
      // Add QR code to the PDF if it exists
      if (fs.existsSync(qrCodePath)) {
        doc.moveDown(2);
        doc.text('Scan to verify:', { align: 'right' });
        doc.image(qrCodePath, doc.page.width - 150, doc.y - 10, { width: 100 });
        doc.moveDown(0.5);
        doc.fontSize(10).text('Verify at: ' + `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificate.verificationId}`, 
          { align: 'right' });
      } else {
        console.warn(`QR code not found at path: ${qrCodePath}`);
      }
      
      // Add school logo or watermark
      doc.save();
      doc.translate(doc.page.width / 2, doc.page.height / 2);
      doc.scale(0.6);
      doc.fillOpacity(0.08);
      doc.fontSize(100).text('School MS', -250, 0, { align: 'center' });
      doc.restore();
      
      // Finalize the PDF
      doc.end();
      
      console.log(`Generated certificate PDF at ${filePath}`);
      
      // Update the certificate with the download URL
      await certificateModel.update(certificate.id, { 
        downloadUrl
      } as UpdateCertificateDTO);
      
      return downloadUrl;
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      throw error;
    }
  }

  // Add a test endpoint to generate a certificate with QR code
  testGenerateCertificate = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Create a test certificate
      const certificateData: CreateCertificateDTO = {
        studentId: req.user?.userId || 'test-student-id',
        title: 'Test Certificate with QR Code',
        issueDate: new Date(),
        issuer: 'Test School',
        type: 'Academic',
        description: 'This is a test certificate generated to demonstrate QR code functionality',
        skills: ['JavaScript', 'React', 'Node.js']
      };
      
      const certificateId = await certificateModel.create(certificateData);
      
      // Generate the PDF certificate with QR code
      const certificate = await certificateModel.findById(certificateId);
      if (certificate) {
        await this.generateCertificatePdf(certificate);
      }
      
      const newCertificate = await certificateModel.findById(certificateId);
      
      res.status(201).json({
        error: false,
        data: { certificate: newCertificate },
        message: 'Test certificate created successfully'
      });
    } catch (error) {
      console.error('Error generating test certificate:', error);
      res.status(500).json({
        error: true,
        message: 'Failed to generate test certificate'
      });
    }
  });

  /**
   * Generate PDFs for all certificates that don't have one
   */
  generateAllCertificatePdfs = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get all certificates
      const certificates = await certificateModel.findAll();
      
      // Filter certificates without download URLs
      const certificatesWithoutPdfs = certificates.filter((cert: any) => !cert.downloadUrl);
      
      if (certificatesWithoutPdfs.length === 0) {
        return res.status(200).json({
          error: false,
          message: 'All certificates already have PDFs'
        });
      }
      
      // Generate PDFs for each certificate
      const results = [];
      for (const certificate of certificatesWithoutPdfs) {
        try {
          const downloadUrl = await this.generateCertificatePdf(certificate);
          results.push({
            id: certificate.id,
            title: certificate.title,
            downloadUrl,
            success: true
          });
        } catch (error: any) {
          console.error(`Error generating PDF for certificate ${certificate.id}:`, error);
          results.push({
            id: certificate.id,
            title: certificate.title,
            success: false,
            error: error.message
          });
        }
      }
      
      res.status(200).json({
        error: false,
        data: {
          total: certificatesWithoutPdfs.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        },
        message: `Generated ${results.filter(r => r.success).length} out of ${certificatesWithoutPdfs.length} certificate PDFs`
      });
    } catch (error: any) {
      console.error('Error in generateAllCertificatePdfs:', error);
      res.status(500).json({
        error: true,
        message: `Error generating certificate PDFs: ${error.message}`
      });
    }
  });

  /**
   * Public test endpoint to generate PDFs for all certificates
   */
  publicGeneratePdfs = asyncHandler(async (req: Request, res: Response) => {
    try {
      // Get all certificates
      const certificates = await certificateModel.findAll();
      
      // Filter certificates without download URLs or force regenerate all
      const forceAll = req.query.force === 'true';
      const certificatesToProcess = forceAll 
        ? certificates 
        : certificates.filter((cert: any) => !cert.downloadUrl);
      
      if (certificatesToProcess.length === 0) {
        return res.status(200).json({
          error: false,
          message: 'All certificates already have PDFs'
        });
      }
      
      // Generate PDFs for each certificate
      const results = [];
      for (const certificate of certificatesToProcess) {
        try {
          const downloadUrl = await this.generateCertificatePdf(certificate);
          results.push({
            id: certificate.id,
            title: certificate.title,
            downloadUrl,
            success: true
          });
        } catch (error: any) {
          console.error(`Error generating PDF for certificate ${certificate.id}:`, error);
          results.push({
            id: certificate.id,
            title: certificate.title,
            success: false,
            error: error.message
          });
        }
      }
      
      res.status(200).json({
        error: false,
        data: {
          total: certificatesToProcess.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        },
        message: `Generated ${results.filter(r => r.success).length} out of ${certificatesToProcess.length} certificate PDFs`
      });
    } catch (error: any) {
      console.error('Error in publicGeneratePdfs:', error);
      res.status(500).json({
        error: true,
        message: `Error generating certificate PDFs: ${error.message}`
      });
    }
  });
}

export const certificateController = new CertificateController();
export default certificateController; 