const mysql = require('mysql2/promise');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

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

    // Check if payments table exists
    console.log('Checking if payments table exists...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'payments'");
    if (tables.length > 0) {
      console.log('Payments table already exists! Dropping it first...');
      await connection.query('DROP TABLE IF EXISTS payment_methods');
      await connection.query('DROP TABLE IF EXISTS invoices');
      await connection.query('DROP TABLE IF EXISTS payments');
      console.log('Tables dropped successfully.');
    }

    // Create the payments table with correct foreign key
    console.log('Creating payments table with correct foreign key...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
        paymentMethod ENUM('credit_card', 'paypal', 'bank_transfer', 'cash'),
        transactionId VARCHAR(255),
        dueDate DATE NOT NULL,
        paymentDate DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payments_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Payments table created successfully!');

    // Create the invoices table
    console.log('Creating invoices table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        paymentId VARCHAR(36) NOT NULL,
        invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
        studentId VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
        dueDate DATE NOT NULL,
        issueDate DATE NOT NULL,
        paidDate DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payment_id (paymentId),
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_invoices_payment FOREIGN KEY (paymentId) REFERENCES payments(id) ON DELETE CASCADE,
        CONSTRAINT fk_invoices_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Invoices table created successfully!');

    // Create the payment methods table
    console.log('Creating payment methods table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        type ENUM('credit_card', 'paypal', 'bank_account') NOT NULL,
        lastFour VARCHAR(4),
        expiryDate VARCHAR(7),
        isDefault BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payment_methods_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Payment methods table created successfully!');

    // Insert a test payment to verify everything works
    console.log('Inserting a test payment...');
    
    // First, get a valid student ID from the users table
    const [students] = await connection.query(`
      SELECT id FROM users WHERE role = 'student' LIMIT 1
    `);
    
    if (students.length === 0) {
      console.log('No students found in the database. Skipping test payment creation.');
    } else {
      const studentId = students[0].id;
      const paymentId = uuidv4();
      
      await connection.query(`
        INSERT INTO payments (
          id, studentId, amount, description, status, paymentMethod, dueDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        paymentId,
        studentId,
        100.00,
        'Test payment',
        'pending',
        'credit_card',
        new Date()
      ]);
      
      console.log(`Test payment created with ID: ${paymentId} for student ID: ${studentId}`);
    }

    console.log('\nAll payment tables created successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
run(); 