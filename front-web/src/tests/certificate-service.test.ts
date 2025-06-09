import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { certificateService } from '../services/certificate-service';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock API responses
const mockCertificates = [
  {
    id: 'cert-1',
    title: 'Course Completion',
    issueDate: '2023-05-31',
    issuer: 'University',
    type: 'Academic',
    status: 'valid',
    verificationId: 'verify-1',
    studentId: 'student-1',
    description: 'Certificate for completing the course',
    skills: ['JavaScript', 'React'],
    createdAt: '2023-05-31',
    updatedAt: '2023-05-31',
  },
  {
    id: 'cert-2',
    title: 'Achievement Award',
    issueDate: '2023-06-15',
    issuer: 'University',
    type: 'Achievement',
    status: 'valid',
    verificationId: 'verify-2',
    studentId: 'student-1',
    description: 'Certificate for outstanding achievement',
    skills: ['Leadership', 'Teamwork'],
    createdAt: '2023-06-15',
    updatedAt: '2023-06-15',
  },
];

const mockVerification = {
  isValid: true,
  certificate: mockCertificates[0],
  verifiedAt: new Date().toISOString(),
};

// Setup MSW server
const server = setupServer(
  // GET student certificates
  http.get('http://localhost:3001/api/certificates/student', () => {
    return HttpResponse.json(mockCertificates);
  }),
  
  // GET certificate by ID
  http.get('http://localhost:3001/api/certificates/:id', ({ params }) => {
    const certificateId = params.id as string;
    const certificate = mockCertificates.find(c => c.id === certificateId);
    
    if (!certificate) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json(certificate);
  }),
  
  // GET verify certificate
  http.get('http://localhost:3001/api/certificates/verify/:verificationId', ({ params }) => {
    const verificationId = params.verificationId as string;
    const certificate = mockCertificates.find(c => c.verificationId === verificationId);
    
    if (!certificate) {
      return HttpResponse.json({ 
        isValid: false,
        message: 'Certificate not found'
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      isValid: true,
      certificate,
      verifiedAt: new Date().toISOString(),
    });
  }),
  
  // POST download certificate
  http.post('http://localhost:3001/api/certificates/download/:id', () => {
    return new HttpResponse('PDF_BINARY_DATA', {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificate.pdf"',
      },
    });
  })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Close server after all tests
afterAll(() => server.close());

describe('Certificate Service Integration', () => {
  it('should fetch student certificates', async () => {
    const result = await certificateService.getStudentCertificates();
    expect(result).toEqual(mockCertificates);
  });
  
  it('should fetch a certificate by ID', async () => {
    const result = await certificateService.getCertificateById('cert-1');
    expect(result).toEqual(mockCertificates[0]);
  });
  
  it('should verify a certificate', async () => {
    const result = await certificateService.verifyCertificate('verify-1');
    expect(result).toHaveProperty('isValid', true);
    expect(result).toHaveProperty('certificate');
    expect(result.certificate).toEqual(mockCertificates[0]);
  });
  
  it('should handle certificate download', async () => {
    // Mock the global fetch to track the download request
    const originalFetch = global.fetch;
    const mockFetch = vi.fn().mockImplementation(() => 
      Promise.resolve(new Response('PDF_BINARY_DATA', {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="certificate.pdf"',
        },
      }))
    );
    
    global.fetch = mockFetch;
    
    const result = await certificateService.downloadCertificate('cert-1');
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/certificates/download/cert-1',
      expect.objectContaining({
        method: 'POST',
      })
    );
    
    expect(result).toBeInstanceOf(Blob);
    
    // Restore the original fetch
    global.fetch = originalFetch;
  });
}); 