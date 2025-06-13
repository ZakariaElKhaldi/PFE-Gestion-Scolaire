const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

async function generateQRCode(verificationId, certificateId) {
  const publicDir = path.join(__dirname, '../public');
  const qrDir = path.join(publicDir, 'certificates/qr');
  
  // Create directories if they don't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }
  
  const filePath = path.join(qrDir, `${certificateId}.png`);
  const verificationUrl = `http://localhost:5173/verify-certificate/${verificationId}`;
  
  await QRCode.toFile(filePath, verificationUrl, {
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    width: 300,
    margin: 1
  });
  
  return `/certificates/qr/${certificateId}.png`;
}

function generateVerificationId(title, studentId) {
  // Generate a verification ID based on the title and student ID
  // Format: CERT-[First 3 chars of title]-[Last 4 chars of student ID]-[Random 4 digits]
  const titlePrefix = title.replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase();
  const studentSuffix = studentId.substring(studentId.length - 4);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  return `CERT-${titlePrefix}-${studentSuffix}-${randomDigits}`;
}

async function run() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });

    console.log('Fetching students...');
    // Get students
    const [students] = await connection.query(`
      SELECT id, firstName, lastName FROM users WHERE role = 'student' LIMIT 3
    `);

    if (students.length === 0) {
      console.log('No students found. Please create some students first.');
      await connection.end();
      return;
    }

    console.log(`Found ${students.length} students`);
    
    // Certificate templates
    const certificateTemplates = [
      {
        title: 'Web Development Fundamentals',
        description: 'This certificate verifies proficiency in HTML, CSS, and JavaScript fundamentals',
        issuer: 'School of Technology',
        type: 'Technical',
        skills: ['HTML', 'CSS', 'JavaScript'],
        validityDays: 365
      },
      {
        title: 'Database Management',
        description: 'This certificate verifies proficiency in database management systems and SQL',
        issuer: 'School of Technology',
        type: 'Academic',
        skills: ['SQL', 'Database Design', 'Data Modeling'],
        validityDays: 365
      },
      {
        title: 'Mobile App Development',
        description: 'This certificate verifies proficiency in mobile application development',
        issuer: 'School of Technology',
        type: 'Technical',
        skills: ['React Native', 'iOS', 'Android'],
        validityDays: 365
      }
    ];

    // Create certificates for each student
    for (const student of students) {
      console.log(`Creating certificates for ${student.firstName} ${student.lastName}...`);
      
      for (const template of certificateTemplates) {
        const id = uuidv4();
        const issueDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + template.validityDays);
        
        const verificationId = generateVerificationId(template.title, student.id);
        
        // Generate QR code
        const qrCodeUrl = await generateQRCode(verificationId, id);
        
        // Insert certificate
        await connection.query(`
          INSERT INTO certificates (
            id, studentId, title, issueDate, expiryDate, issuer, 
            type, status, verificationId, description, skills, qrCodeUrl
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          id,
          student.id,
          template.title,
          issueDate,
          expiryDate,
          template.issuer,
          template.type,
          'valid',
          verificationId,
          template.description,
          JSON.stringify(template.skills),
          qrCodeUrl
        ]);
        
        console.log(`- Created certificate: ${template.title}`);
      }
    }

    console.log('All certificates created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
run(); 