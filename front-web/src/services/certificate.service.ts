import { apiClient } from '../lib/api-client';
import { API_CONFIG } from '../config/api-config';

export interface Certificate {
  id: string;
  title: string;
  issueDate: string;
  expiryDate?: string;
  issuer: string;
  type: 'Academic' | 'Technical' | 'Professional' | 'Attestation' | 'Achievement';
  status: 'valid' | 'expired' | 'pending' | 'revoked';
  verificationId: string;
  studentId: string;
  courseId?: string;
  downloadUrl?: string;
  description: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificateRequest {
  studentId: string;
  courseId?: string;
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

export interface CertificateFilters {
  type?: string;
  status?: string;
  studentId?: string;
  courseId?: string;
}

class CertificateService {
  private readonly basePath = '/certificates';

  /**
   * Get all certificates with optional filters
   */
  async getCertificates(filters?: CertificateFilters): Promise<Certificate[]> {
    try {
      const { data } = await apiClient.get<Certificate[]>(this.basePath, filters as Record<string, string>);
      return data;
    } catch (error) {
      console.error('Error fetching certificates:', error);
      return [];
    }
  }

  /**
   * Get all certificates for the current student
   */
  async getStudentCertificates(): Promise<Certificate[]> {
    try {
      const { data } = await apiClient.get<Certificate[]>(`${this.basePath}/student`);
      return data;
    } catch (error) {
      console.error('Error fetching student certificates:', error);
      return [];
    }
  }

  /**
   * Get a specific certificate
   */
  async getCertificate(id: string): Promise<Certificate> {
    const { data } = await apiClient.get<Certificate>(`${this.basePath}/${id}`);
    return data;
  }

  /**
   * Download a certificate
   * This function returns the URL to download the certificate
   */
  getDownloadUrl(id: string): string {
    return `${API_CONFIG.API_URL}${this.basePath}/download/${id}`;
  }

  /**
   * Verify a certificate by verification ID
   */
  async verifyCertificate(verificationId: string): Promise<VerificationResult> {
    const { data } = await apiClient.get<VerificationResult>(`${this.basePath}/verify/${verificationId}`);
    return data;
  }

  /**
   * Admin: Get all certificates for a specific student
   */
  async getStudentCertificatesById(studentId: string): Promise<Certificate[]> {
    const { data } = await apiClient.get<Certificate[]>(`${this.basePath}/student/${studentId}`);
    return data;
  }

  /**
   * Admin: Create a new certificate
   */
  async createCertificate(certificate: CreateCertificateRequest): Promise<Certificate> {
    const { data } = await apiClient.post<Certificate>(this.basePath, certificate);
    return data;
  }

  /**
   * Admin: Update a certificate
   */
  async updateCertificate(id: string, certificate: UpdateCertificateRequest): Promise<Certificate> {
    const { data } = await apiClient.put<Certificate>(`${this.basePath}/${id}`, certificate);
    return data;
  }

  /**
   * Admin: Delete a certificate
   */
  async deleteCertificate(id: string): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Admin: Generate a course completion certificate
   */
  async generateCourseCompletionCertificate(request: GenerateCourseCompletionRequest): Promise<Certificate> {
    const { data } = await apiClient.post<Certificate>(`${this.basePath}/generate/course-completion`, request);
    return data;
  }

  /**
   * Upload a certificate PDF file
   */
  async uploadCertificatePdf(certificateId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('certificate', file);

    // Use fetch directly for file upload
    const response = await fetch(`${API_CONFIG.API_URL}${this.basePath}/${certificateId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload certificate PDF');
    }

    const data = await response.json();
    return data;
  }

  /**
   * Download a certificate PDF
   */
  async downloadCertificate(id: string): Promise<Blob> {
    const response = await fetch(`${API_CONFIG.API_URL}${this.basePath}/download/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }

    return await response.blob();
  }
}

export const certificateService = new CertificateService();
export default certificateService; 