const fs = require('fs');
const path = require('path');

/**
 * Create necessary directories for certificate files
 */
function createCertificateDirectories() {
  try {
    const publicDir = path.join(__dirname, '../public');
    const certificatesDir = path.join(publicDir, 'certificates');
    const qrDir = path.join(certificatesDir, 'qr');
    const pdfDir = path.join(certificatesDir, 'pdf');
    
    // Create directories if they don't exist
    [publicDir, certificatesDir, qrDir, pdfDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      } else {
        console.log(`Directory already exists: ${dir}`);
      }
    });
    
    console.log('Certificate directories setup complete!');
  } catch (error) {
    console.error('Failed to create certificate directories:', error);
  }
}

// Run the function
createCertificateDirectories(); 