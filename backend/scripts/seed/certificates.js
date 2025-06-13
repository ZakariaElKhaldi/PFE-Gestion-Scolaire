/**
 * Seed script for certificates
 */
const { uuidv4, createTableIfNotExists } = require('./utils');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

/**
 * Generate QR code for a certificate
 * @param {string} verificationId - ID used for verification
 * @param {string} certificateId - Certificate ID
 * @returns {Promise<string>} - Path to the QR code image
 */
async function generateQRCode(verificationId, certificateId) {
  const publicDir = path.join(__dirname, '../../public');
  const certificatesDir = path.join(publicDir, 'certificates');
  const qrDir = path.join(certificatesDir, 'qr');
  
  // Create directories if they don't exist
  [publicDir, certificatesDir, qrDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  const filePath = path.join(qrDir, `${certificateId}.png`);
  const verificationUrl = `http://localhost:5173/verify-certificate/${verificationId}`;
  
  await QRCode.toFile(filePath, verificationUrl, {
    color: {
      dark: '#000',
      light: '#fff'
    },
    width: 300,
    margin: 1
  });
  
  return `/certificates/qr/${certificateId}.png`;
}

/**
 * Seed certificates
 * @param {object} connection - MySQL connection
 * @param {object} userData - User IDs from users seed
 * @returns {object} - Certificate IDs for reference
 */
async function seedCertificates(connection, userData) {
  console.log('Creating certificates...');
  
  // Extract student IDs
  const { studentId1, studentId2, studentId3, studentId4, studentId5 } = userData;
  
  try {
    // Create certificates table if it doesn't exist
    await createTableIfNotExists(connection, 'certificates', `
      CREATE TABLE IF NOT EXISTS certificates (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        issueDate DATETIME NOT NULL,
        expiryDate DATETIME,
        issuer VARCHAR(100) NOT NULL,
        type ENUM('Academic', 'Technical', 'Professional', 'Attestation', 'Achievement') NOT NULL,
        status ENUM('valid', 'expired', 'pending', 'revoked') NOT NULL DEFAULT 'valid',
        verificationId VARCHAR(36) NOT NULL,
        qrCodeUrl VARCHAR(255),
        downloadUrl VARCHAR(255),
        metadata JSON,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_verification (verificationId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    
    // Clean up existing certificates
    await connection.query(`
      DELETE FROM certificates 
      WHERE studentId IN (?, ?, ?, ?, ?)
    `, [studentId1, studentId2, studentId3, studentId4, studentId5]).catch(err => {
      console.warn('Warning when cleaning certificates:', err.message);
    });
    
    // Current date for relative dates
    const now = new Date();
    
    // Generate certificate IDs
    const certificateIds = [];
    
    // Create certificates for Student Johnson (studentId1)
    const cert1Id = uuidv4();
    const cert1VerificationId = uuidv4();
    const qrCodeUrl1 = await generateQRCode(cert1VerificationId, cert1Id);
    
    await connection.query(`
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, type, status, verificationId, qrCodeUrl, downloadUrl, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cert1Id,
      studentId1,
      'Mathematics Excellence Award',
      new Date(now.getFullYear(), now.getMonth() - 2, 15), // 2 months ago
      new Date(now.getFullYear() + 5, now.getMonth(), 15), // 5 years from now
      'National Mathematics Association',
      'Academic',
      'valid',
      cert1VerificationId,
      qrCodeUrl1,
      '/certificates/pdf/math_excellence.pdf',
      JSON.stringify({
        grade: 'A+',
        score: 98,
        honors: true,
        signedBy: 'Prof. David Wilson'
      })
    ]);
    console.log(`Certificate created for Student Johnson: Mathematics Excellence Award`);
    certificateIds.push(cert1Id);
    
    const cert2Id = uuidv4();
    const cert2VerificationId = uuidv4();
    const qrCodeUrl2 = await generateQRCode(cert2VerificationId, cert2Id);
    
    await connection.query(`
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, type, status, verificationId, qrCodeUrl, downloadUrl, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cert2Id,
      studentId1,
      'Computer Science Fundamentals',
      new Date(now.getFullYear(), now.getMonth() - 1, 5), // 1 month ago
      new Date(now.getFullYear() + 3, now.getMonth(), 5), // 3 years from now
      'Tech Education Institute',
      'Technical',
      'valid',
      cert2VerificationId,
      qrCodeUrl2,
      '/certificates/pdf/cs_fundamentals.pdf',
      JSON.stringify({
        skills: ['Programming', 'Algorithms', 'Data Structures'],
        completionDate: new Date(now.getFullYear(), now.getMonth() - 1, 5).toISOString(),
        instructor: 'Sarah Johnson'
      })
    ]);
    console.log(`Certificate created for Student Johnson: Computer Science Fundamentals`);
    certificateIds.push(cert2Id);
    
    // Create certificate for Mike Williams (studentId2)
    const cert3Id = uuidv4();
    const cert3VerificationId = uuidv4();
    const qrCodeUrl3 = await generateQRCode(cert3VerificationId, cert3Id);
    
    await connection.query(`
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, type, status, verificationId, qrCodeUrl, downloadUrl, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cert3Id,
      studentId2,
      'Robotics Competition Winner',
      new Date(now.getFullYear(), now.getMonth() - 3, 20), // 3 months ago
      null, // No expiry
      'National Robotics League',
      'Achievement',
      'valid',
      cert3VerificationId,
      qrCodeUrl3,
      '/certificates/pdf/robotics_winner.pdf',
      JSON.stringify({
        competition: 'National High School Robotics Challenge',
        rank: 1,
        team: 'Tech Titans',
        project: 'Autonomous Rescue Robot'
      })
    ]);
    console.log(`Certificate created for Mike Williams: Robotics Competition Winner`);
    certificateIds.push(cert3Id);
    
    // Create certificate for Emma Davis (studentId3)
    const cert4Id = uuidv4();
    const cert4VerificationId = uuidv4();
    const qrCodeUrl4 = await generateQRCode(cert4VerificationId, cert4Id);
    
    await connection.query(`
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, type, status, verificationId, qrCodeUrl, downloadUrl, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cert4Id,
      studentId3,
      'Creative Writing Excellence',
      new Date(now.getFullYear(), now.getMonth() - 4, 10), // 4 months ago
      null, // No expiry
      'Literary Arts Foundation',
      'Academic',
      'valid',
      cert4VerificationId,
      qrCodeUrl4,
      '/certificates/pdf/writing_excellence.pdf',
      JSON.stringify({
        category: 'Short Story',
        title: 'Echoes of Tomorrow',
        judge: 'Prof. Amanda Richards',
        publication: 'Youth Literary Review'
      })
    ]);
    console.log(`Certificate created for Emma Davis: Creative Writing Excellence`);
    certificateIds.push(cert4Id);
    
    // Create an expired certificate for demonstration
    const cert5Id = uuidv4();
    const cert5VerificationId = uuidv4();
    const qrCodeUrl5 = await generateQRCode(cert5VerificationId, cert5Id);
    
    await connection.query(`
      INSERT INTO certificates (
        id, studentId, title, issueDate, expiryDate, issuer, type, status, verificationId, qrCodeUrl, downloadUrl, metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cert5Id,
      studentId1,
      'Science Fair Participation',
      new Date(now.getFullYear() - 2, now.getMonth(), 15), // 2 years ago
      new Date(now.getFullYear() - 1, now.getMonth(), 15), // 1 year ago (expired)
      'Regional Science Association',
      'Attestation',
      'expired',
      cert5VerificationId,
      qrCodeUrl5,
      '/certificates/pdf/science_fair.pdf',
      JSON.stringify({
        project: 'Solar Energy Efficiency',
        category: 'Environmental Science',
        venue: 'City Convention Center',
        mentor: 'Dr. Robert Chen'
      })
    ]);
    console.log(`Expired certificate created for Student Johnson: Science Fair Participation`);
    certificateIds.push(cert5Id);
    
    return {
      success: true,
      certificateIds: certificateIds,
      message: 'Certificates created successfully'
    };
  } catch (error) {
    console.error('Error creating certificates:', error);
    throw error;
  }
}

module.exports = seedCertificates; 