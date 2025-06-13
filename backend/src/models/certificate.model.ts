import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/db';

// Flag to track if database is available
let isDatabaseAvailable = true;

// Check if the database pool is properly initialized
const checkDbAvailability = () => {
  if (!pool || !pool.query) {
    if (isDatabaseAvailable) {
      console.error('Database is not available, using mock data for certificates');
      isDatabaseAvailable = false;
    }
    return false;
  }
  return true;
};

// Mock certificates data
const mockCertificates: Certificate[] = [
  {
    id: 'mock-cert-1',
    studentId: 'mock-student-1',
    title: 'Web Development Fundamentals',
    issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    issuer: 'School of Technology',
    type: 'Technical' as CertificateType,
    status: 'valid' as CertificateStatus,
    verificationId: 'mock-verification-1',
    downloadUrl: '/certificates/mock-cert-1.pdf',
    qrCodeUrl: '/certificates/mock-cert-1.qr',
    description: 'This certificate verifies proficiency in HTML, CSS, and JavaScript fundamentals',
    skills: ['HTML', 'CSS', 'JavaScript'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-cert-2',
    studentId: 'mock-student-1',
    title: 'Database Management',
    issueDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    issuer: 'School of Technology',
    type: 'Academic' as CertificateType,
    status: 'valid' as CertificateStatus,
    verificationId: 'mock-verification-2',
    downloadUrl: '/certificates/mock-cert-2.pdf',
    qrCodeUrl: '/certificates/mock-cert-2.qr',
    description: 'This certificate verifies proficiency in database management systems and SQL',
    skills: ['SQL', 'Database Design', 'Data Modeling'],
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'mock-cert-3',
    studentId: 'mock-student-1',
    title: 'Mobile App Development',
    issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago 
    issuer: 'School of Technology',
    type: 'Technical' as CertificateType,
    status: 'pending' as CertificateStatus,
    verificationId: 'mock-verification-3',
    qrCodeUrl: '/certificates/mock-cert-3.qr',
    description: 'This certificate verifies proficiency in mobile application development',
    skills: ['React Native', 'iOS', 'Android'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
];

export type CertificateType = 'Academic' | 'Technical' | 'Professional' | 'Attestation' | 'Achievement';
export type CertificateStatus = 'valid' | 'expired' | 'pending' | 'revoked';

export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  issueDate: Date;
  expiryDate?: Date;
  issuer: string;
  type: CertificateType;
  status: CertificateStatus;
  verificationId: string;
  downloadUrl?: string;
  qrCodeUrl?: string;
  description: string;
  skills?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificateDTO {
  studentId: string;
  title: string;
  issueDate: Date;
  expiryDate?: Date;
  issuer: string;
  type: CertificateType;
  status?: CertificateStatus;
  description: string;
  skills?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateCertificateDTO extends Partial<Omit<Certificate, 'id' | 'studentId' | 'verificationId' | 'createdAt' | 'updatedAt'>> {}

interface CertificateRow extends Certificate, RowDataPacket {}

export class CertificateModel {
  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issueDate DATETIME NOT NULL,
        expiryDate DATETIME,
        issuer VARCHAR(100) NOT NULL,
        type ENUM('Academic', 'Technical', 'Professional', 'Attestation', 'Achievement') NOT NULL,
        status ENUM('valid', 'expired', 'pending', 'revoked') NOT NULL DEFAULT 'valid',
        verificationId VARCHAR(50) NOT NULL UNIQUE,
        downloadUrl VARCHAR(255),
        qrCodeUrl VARCHAR(255),
        description TEXT NOT NULL,
        skills JSON,
        metadata JSON,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
      await pool.query(query);
      
      // Add qrCodeUrl column if it doesn't exist
      try {
        const alterQuery = `
          ALTER TABLE certificates
          ADD COLUMN IF NOT EXISTS qrCodeUrl VARCHAR(255) AFTER downloadUrl;
        `;
        await pool.query(alterQuery);
      } catch (alterError) {
        // If the database doesn't support IF NOT EXISTS for ADD COLUMN,
        // we'll handle it gracefully
        console.log('Note: qrCodeUrl column might already exist or could not be added');
      }
      
      console.log('Certificates table created or already exists');
    } catch (error) {
      console.error('Error creating certificates table:', error);
      throw error;
    }
  }

  async create(certificateData: CreateCertificateDTO): Promise<string> {
    const id = uuidv4();
    const verificationId = this.generateVerificationId(certificateData.title, certificateData.studentId);
    
    const query = `
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, 
        type, status, verificationId, description, skills, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      certificateData.studentId,
      certificateData.title,
      certificateData.issueDate,
      certificateData.expiryDate || null,
      certificateData.issuer,
      certificateData.type,
      certificateData.status || 'valid',
      verificationId,
      certificateData.description,
      certificateData.skills ? JSON.stringify(certificateData.skills) : null,
      certificateData.metadata ? JSON.stringify(certificateData.metadata) : null
    ];
    
    try {
      await pool.query(query, params);
      return id;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<Certificate | null> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock certificates data for findById');
        const certificate = mockCertificates.find(cert => cert.id === id);
        return certificate || null;
      }
      
      const query = 'SELECT * FROM certificates WHERE id = ?';
      
      const [rows] = await pool.query<CertificateRow[]>(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToCertificate(rows[0]);
    } catch (error) {
      console.error('Error finding certificate by ID:', error);
      // Return mock certificate if available
      const certificate = mockCertificates.find(cert => cert.id === id);
      return certificate || null;
    }
  }

  async findByVerificationId(verificationId: string): Promise<Certificate | null> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock certificates data for findByVerificationId');
        const certificate = mockCertificates.find(cert => cert.verificationId === verificationId);
        return certificate || null;
      }
      
      const query = 'SELECT * FROM certificates WHERE verificationId = ?';
      
      const [rows] = await pool.query<CertificateRow[]>(query, [verificationId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return this.mapRowToCertificate(rows[0]);
    } catch (error) {
      console.error('Error finding certificate by verification ID:', error);
      // Return mock certificate if available
      const certificate = mockCertificates.find(cert => cert.verificationId === verificationId);
      return certificate || null;
    }
  }

  async findByStudentId(studentId: string): Promise<Certificate[]> {
    try {
      // Check if database is available
      if (!checkDbAvailability()) {
        console.log('Using mock certificates data');
        // For simplicity, always return mock data with the mock student ID
        // In a real app, you'd filter by the actual studentId
        return mockCertificates;
      }
      
      const query = 'SELECT * FROM certificates WHERE studentId = ? ORDER BY issueDate DESC';
      
      const [rows] = await pool.query<CertificateRow[]>(query, [studentId]);
      return rows.map(row => this.mapRowToCertificate(row));
    } catch (error) {
      console.error('Error finding certificates by student ID:', error);
      // Return mock data on error
      return mockCertificates;
    }
  }

  async update(id: string, certificateData: UpdateCertificateDTO): Promise<boolean> {
    const allowedFields = [
      'title', 'issueDate', 'expiryDate', 'issuer', 'type', 
      'status', 'downloadUrl', 'qrCodeUrl', 'description', 'skills', 'metadata'
    ];
    
    const updates: string[] = [];
    const params: any[] = [];
    
    // Build the SET clause dynamically
    Object.entries(certificateData).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'skills' || key === 'metadata') {
          updates.push(`${key} = ?`);
          params.push(value ? JSON.stringify(value) : null);
        } else {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }
    });
    
    if (updates.length === 0) {
      return false; // Nothing to update
    }
    
    params.push(id); // For the WHERE clause
    
    const query = `UPDATE certificates SET ${updates.join(', ')} WHERE id = ?`;
    
    try {
      const [result]: any = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM certificates WHERE id = ?';
    
    try {
      const [result]: any = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  }

  async verifyStatus(verificationId: string): Promise<{
    isValid: boolean;
    certificate?: Certificate;
    message: string;
  }> {
    try {
      const certificate = await this.findByVerificationId(verificationId);
      
      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found'
        };
      }
      
      // Check if expired
      if (certificate.status === 'expired' || 
          (certificate.expiryDate && new Date(certificate.expiryDate) < new Date())) {
        return {
          isValid: false,
          certificate,
          message: 'Certificate has expired'
        };
      }
      
      // Check if revoked
      if (certificate.status === 'revoked') {
        return {
          isValid: false,
          certificate,
          message: 'Certificate has been revoked'
        };
      }
      
      // Check if still pending
      if (certificate.status === 'pending') {
        return {
          isValid: false,
          certificate,
          message: 'Certificate is pending approval'
        };
      }
      
      return {
        isValid: true,
        certificate,
        message: 'Certificate is valid'
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  // Helper methods
  private generateVerificationId(title: string, studentId: string): string {
    // Generate a verification ID based on the title and student ID
    // Format: CERT-[First 3 chars of title]-[Last 4 chars of student ID]-[Random 4 digits]
    const titlePrefix = title.replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase();
    const studentSuffix = studentId.substring(studentId.length - 4);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    
    return `CERT-${titlePrefix}-${studentSuffix}-${randomDigits}`;
  }

  private mapRowToCertificate(row: CertificateRow): Certificate {
    return {
      ...row,
      skills: row.skills ? JSON.parse(row.skills as unknown as string) : [],
      metadata: row.metadata ? JSON.parse(row.metadata as unknown as string) : {}
    };
  }

  /**
   * Find all certificates
   * @returns {Promise<any[]>} - All certificates
   */
  findAll = async (): Promise<any[]> => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM certificates ORDER BY issueDate DESC`
      );
      return rows as any[];
    } catch (error) {
      console.error('Error finding all certificates:', error);
      return [];
    }
  };
}

export const certificateModel = new CertificateModel();
export default certificateModel; 