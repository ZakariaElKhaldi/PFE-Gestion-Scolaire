import { query } from '../config/db';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Migration to create the certificates table and required directories
 */
export async function createCertificatesTable(): Promise<void> {
  logger.db('Creating certificates table if it does not exist');
  
  // Create the certificates table
  const sql = `
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  try {
    await query(sql);
    logger.db('Certificates table created or already exists');
    
    // Create necessary directories for certificate files
    createCertificateDirectories();
  } catch (error) {
    logger.error('Failed to create certificates table', error);
    throw error;
  }
}

/**
 * Create necessary directories for certificate files
 */
function createCertificateDirectories(): void {
  try {
    const publicDir = path.join(__dirname, '../../public');
    const certificatesDir = path.join(publicDir, 'certificates');
    const qrDir = path.join(certificatesDir, 'qr');
    const pdfDir = path.join(certificatesDir, 'pdf');
    
    // Create directories if they don't exist
    [publicDir, certificatesDir, qrDir, pdfDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.db(`Created directory: ${dir}`);
      }
    });
    
    logger.db('Certificate directories created or already exist');
  } catch (error) {
    logger.error('Failed to create certificate directories', error);
  }
} 