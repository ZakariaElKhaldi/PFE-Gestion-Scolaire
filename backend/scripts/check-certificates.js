const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to database...');
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });
    console.log('Connected successfully!');

    console.log('Checking if certificates table exists...');
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'certificates'");
    if (tables.length === 0) {
      console.log('Certificates table does not exist!');
      await connection.end();
      return;
    }
    console.log('Certificates table exists!');

    try {
      console.log('Checking certificates table structure...');
      // Get table structure
      const [columns] = await connection.query('SHOW COLUMNS FROM certificates');
      
      console.log('\nCertificates table structure:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key === 'PRI' ? '(Primary Key)' : ''}`);
      });
    } catch (error) {
      console.error('Error getting table structure:', error.message);
    }

    try {
      // Check if there are any certificates in the table
      console.log('\nChecking for certificates in the table...');
      const [certificates] = await connection.query('SELECT * FROM certificates');
      
      console.log(`Found ${certificates.length} certificates:`);
      
      // Group certificates by student
      const certificatesByStudent = {};
      
      for (const cert of certificates) {
        if (!certificatesByStudent[cert.studentId]) {
          // Get student info
          const [students] = await connection.query('SELECT firstName, lastName FROM users WHERE id = ?', [cert.studentId]);
          const student = students[0];
          
          certificatesByStudent[cert.studentId] = {
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
            certificates: []
          };
        }
        
        certificatesByStudent[cert.studentId].certificates.push(cert);
      }
      
      // Display certificates grouped by student
      for (const [studentId, data] of Object.entries(certificatesByStudent)) {
        console.log(`\n=== Certificates for ${data.studentName} (${studentId}) ===`);
        
        data.certificates.forEach((cert, index) => {
          console.log(`\nCertificate ${index + 1}: ${cert.title}`);
          console.log(`- ID: ${cert.id}`);
          console.log(`- Issuer: ${cert.issuer}`);
          console.log(`- Type: ${cert.type}`);
          console.log(`- Status: ${cert.status}`);
          console.log(`- Issue Date: ${cert.issueDate}`);
          console.log(`- Expiry Date: ${cert.expiryDate || 'N/A'}`);
          console.log(`- Verification ID: ${cert.verificationId}`);
          console.log(`- QR Code URL: ${cert.qrCodeUrl || 'N/A'}`);
          console.log(`- Download URL: ${cert.downloadUrl || 'N/A'}`);
          console.log(`- Skills: ${cert.skills ? JSON.parse(cert.skills).join(', ') : 'N/A'}`);
        });
      }
    } catch (error) {
      console.error('Error querying certificates:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Run the script
run(); 