import { API_BASE_URL } from '../config/api-config';

export interface Certificate {
  id?: string;
  title: string;
  issueDate: string;
  issuer: string;
  type: string;
  status: string;
  verificationId?: string;
  studentId: string;
  description?: string;
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateVerification {
  isValid: boolean;
  certificate?: Certificate;
  verifiedAt?: string;
  message?: string;
}

export const certificateService = {
  /**
   * Get all certificates for the current student
   */
  async getStudentCertificates(): Promise<Certificate[]> {
    const response = await fetch(`${API_BASE_URL}/certificates/student`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch student certificates: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get a certificate by ID
   * @param certificateId - The ID of the certificate
   */
  async getCertificateById(certificateId: string): Promise<Certificate> {
    const response = await fetch(`${API_BASE_URL}/certificates/${certificateId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch certificate: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Verify a certificate by its verification ID
   * @param verificationId - The verification ID of the certificate
   */
  async verifyCertificate(verificationId: string): Promise<CertificateVerification> {
    const response = await fetch(`${API_BASE_URL}/certificates/verify/${verificationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to verify certificate: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Download a certificate as PDF
   * @param certificateId - The ID of the certificate
   */
  async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/certificates/download/${certificateId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download certificate: ${response.statusText}`);
    }
    
    return response.blob();
  },
  
  /**
   * Generate a shareable link for a certificate
   * @param certificateId - The ID of the certificate
   */
  async generateShareableLink(certificateId: string): Promise<string> {
    const certificate = await this.getCertificateById(certificateId);
    
    if (!certificate.verificationId) {
      throw new Error('Certificate does not have a verification ID');
    }
    
    return `${window.location.origin}/certificates/verify/${certificate.verificationId}`;
  },
}; 