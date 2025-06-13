import { apiClient } from '../lib/api-client';

export interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  expiryDate?: string;
  issuer: string;
  type: 'Academic' | 'Technical' | 'Professional' | 'Attestation' | 'Achievement';
  status: 'valid' | 'expired' | 'pending' | 'revoked';
  verificationId: string;
  downloadUrl?: string;
  qrCodeUrl?: string;
  description: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateRequest {
  studentId: string;
  title: string;
  issueDate: string;
  expiryDate?: string;
  issuer: string;
  type: 'Academic' | 'Technical' | 'Professional' | 'Attestation' | 'Achievement';
  status?: 'valid' | 'expired' | 'pending' | 'revoked';
  description: string;
  skills?: string[];
  generatePdf?: boolean;
}

export interface UpdateCertificateRequest {
  title?: string;
  issueDate?: string;
  expiryDate?: string;
  issuer?: string;
  type?: 'Academic' | 'Technical' | 'Professional' | 'Attestation' | 'Achievement';
  status?: 'valid' | 'expired' | 'pending' | 'revoked';
  description?: string;
  skills?: string[];
  regeneratePdf?: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  certificate?: Certificate;
  message: string;
}

export interface GenerateCourseCompletionRequest {
  studentId: string;
  courseId: string;
  skills?: string[];
}

class CertificateService {
  /**
   * Get all certificates for the current student
   */
  async getStudentCertificates(): Promise<Certificate[]> {
    try {
      const response = await apiClient.get<{
        error?: boolean;
        data?: { certificates: Certificate[] };
        message?: string;
        certificates?: Certificate[];
      }>('/certificates/student');
      
      // Handle different response formats
      if (response.data && response.data.data && response.data.data.certificates) {
        // Standard format with { error, data: { certificates }, message }
        return response.data.data.certificates;
      } else if (response.data && Array.isArray(response.data.certificates)) {
        // Format with { certificates } directly at root
        return response.data.certificates;
      } else if (response.data && Array.isArray(response.data)) {
        // Direct array format
        return response.data as Certificate[];
      } else {
        // Fallback with empty array if no valid format is found
        console.warn('Unexpected response format from certificate API:', response.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      return []; // Return empty array instead of throwing error
    }
  }

  /**
   * Get a specific certificate
   */
  async getCertificate(id: string): Promise<Certificate> {
    const { data } = await apiClient.get<{
      error: boolean;
      data: { certificate: Certificate };
      message: string;
    }>(`/certificates/student/${id}`);
    return data.data.certificate;
  }

  /**
   * Download a certificate
   * This function returns the URL to download the certificate
   */
  getDownloadUrl(id: string): string {
    // Use the API URL from the environment or default to localhost:3001
    const apiUrl = 'http://localhost:3001';
    return `${apiUrl}/api/certificates/public-download/${id}`;
  }

  /**
   * Verify a certificate by verification ID
   */
  async verifyCertificate(verificationId: string): Promise<VerificationResult> {
    const { data } = await apiClient.get<{
      error: boolean;
      data: VerificationResult;
      message: string;
    }>(`/certificates/verify/${verificationId}`);
    return data.data;
  }

  /**
   * Admin: Get all certificates for a specific student
   */
  async getStudentCertificatesById(studentId: string): Promise<Certificate[]> {
    const { data } = await apiClient.get<{
      error: boolean;
      data: { certificates: Certificate[] };
      message: string;
    }>(`/certificates/admin/student/${studentId}`);
    return data.data.certificates;
  }

  /**
   * Admin: Create a new certificate
   */
  async createCertificate(certificate: CreateCertificateRequest): Promise<Certificate> {
    const { data } = await apiClient.post<{
      error: boolean;
      data: { certificate: Certificate };
      message: string;
    }>('/certificates/admin', certificate);
    return data.data.certificate;
  }

  /**
   * Admin: Update a certificate
   */
  async updateCertificate(id: string, certificate: UpdateCertificateRequest): Promise<Certificate> {
    const { data } = await apiClient.put<{
      error: boolean;
      data: { certificate: Certificate };
      message: string;
    }>(`/certificates/admin/${id}`, certificate);
    return data.data.certificate;
  }

  /**
   * Admin: Delete a certificate
   */
  async deleteCertificate(id: string): Promise<void> {
    await apiClient.delete(`/certificates/admin/${id}`);
  }

  /**
   * Admin: Generate a course completion certificate
   */
  async generateCourseCompletionCertificate(request: GenerateCourseCompletionRequest): Promise<Certificate> {
    const { data } = await apiClient.post<{
      error: boolean;
      data: { certificate: Certificate };
      message: string;
    }>('/certificates/generate/course-completion', request);
    return data.data.certificate;
  }
}

export const certificateService = new CertificateService();
export default certificateService; 