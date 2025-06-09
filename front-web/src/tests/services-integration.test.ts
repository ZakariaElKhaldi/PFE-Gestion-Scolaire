import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollmentService } from '../services/enrollment-service';
import { paymentService } from '../services/payment-service';
import { certificateService } from '../services/certificate.service';
import { courseService } from '../services/course-service';

// Mock the API client
vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock fetch for direct API calls
global.fetch = vi.fn();

describe('Service Integration Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Enrollment Service', () => {
    it('should fetch student enrollments', async () => {
      const mockEnrollments = [
        { id: '1', studentId: 'student1', courseId: 'course1', status: 'active' },
        { id: '2', studentId: 'student1', courseId: 'course2', status: 'completed' }
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEnrollments }),
      } as Response);

      const result = await enrollmentService.getStudentEnrollments('student1');
      expect(result).toEqual(mockEnrollments);
    });

    it('should create a new enrollment', async () => {
      const mockEnrollment = { 
        id: '3', 
        studentId: 'student1', 
        courseId: 'course3', 
        status: 'active' 
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockEnrollment }),
      } as Response);

      const result = await enrollmentService.createEnrollment({
        studentId: 'student1',
        courseId: 'course3'
      });
      expect(result).toEqual(mockEnrollment);
    });
  });

  describe('Payment Service', () => {
    it('should fetch payment summary', async () => {
      const mockSummary = {
        totalPaid: 500,
        pendingPayments: 200,
        nextPaymentDue: new Date(),
        overduePayments: 1
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSummary }),
      } as Response);

      const result = await paymentService.getPaymentSummary('student1');
      expect(result).toEqual(mockSummary);
    });

    it('should process a payment', async () => {
      const mockResponse = {
        paymentId: 'payment1',
        invoiceId: 'invoice1',
        invoiceNumber: 'INV-2023-001',
        transactionId: 'tx_123456',
        message: 'Payment processed successfully'
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResponse }),
      } as Response);

      const result = await paymentService.processPayment({
        amount: 100,
        description: 'Tuition payment',
        paymentMethod: 'credit_card',
        studentId: 'student1'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Certificate Service', () => {
    it('should fetch student certificates', async () => {
      const mockCertificates = [
        {
          id: '1',
          title: 'Course Completion',
          issueDate: '2023-01-01',
          issuer: 'University',
          type: 'Academic',
          status: 'valid',
          verificationId: 'verify1',
          studentId: 'student1',
          description: 'Certificate for completing the course',
          skills: ['JavaScript', 'React'],
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        }
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCertificates }),
      } as Response);

      const result = await certificateService.getStudentCertificates();
      expect(result).toEqual(mockCertificates);
    });

    it('should verify a certificate', async () => {
      const mockResult = {
        isValid: true,
        message: 'Certificate is valid',
        certificate: {
          id: '1',
          title: 'Course Completion',
          issueDate: '2023-01-01',
          issuer: 'University',
          type: 'Academic',
          status: 'valid',
          verificationId: 'verify1',
          studentId: 'student1',
          description: 'Certificate for completing the course',
          skills: ['JavaScript', 'React'],
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01'
        }
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResult }),
      } as Response);

      const result = await certificateService.verifyCertificate('verify1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('Course Service', () => {
    it('should fetch courses', async () => {
      const mockCourses = [
        {
          id: '1',
          name: 'Introduction to Programming',
          code: 'CS101',
          description: 'Basic programming concepts',
          teacherId: 'teacher1',
          startDate: '2023-01-01',
          endDate: '2023-05-31',
          credits: 3,
          createdAt: '2022-12-01',
          updatedAt: '2022-12-01'
        }
      ];

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCourses }),
      } as Response);

      const result = await courseService.getCourses();
      expect(result).toEqual(mockCourses);
    });

    it('should fetch a course by id', async () => {
      const mockCourse = {
        id: '1',
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts',
        teacherId: 'teacher1',
        startDate: '2023-01-01',
        endDate: '2023-05-31',
        credits: 3,
        createdAt: '2022-12-01',
        updatedAt: '2022-12-01'
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCourse }),
      } as Response);

      const result = await courseService.getCourse('1');
      expect(result).toEqual(mockCourse);
    });
  });
}); 