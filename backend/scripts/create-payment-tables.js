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

    // Drop tables if they exist (in reverse order of dependencies)
    console.log('Dropping existing payment tables if they exist...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS invoices');
    await connection.query('DROP TABLE IF EXISTS payment_methods');
    await connection.query('DROP TABLE IF EXISTS payments');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables dropped successfully');

    // Create payments table
    console.log('Creating payments table...');
    await connection.query(`
      CREATE TABLE payments (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'completed', 'failed', 'refunded', 'overdue') NOT NULL DEFAULT 'pending',
        paymentMethod ENUM('credit_card', 'paypal', 'bank_transfer', 'cash', 'stripe') NOT NULL,
        transactionId VARCHAR(255),
        paymentGateway ENUM('paypal', 'stripe', 'manual') NOT NULL DEFAULT 'manual',
        gatewayResponse JSON,
        dueDate DATE NOT NULL,
        paymentDate DATETIME,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payments_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Payments table created successfully');

    // Create payment methods table
    console.log('Creating payment methods table...');
    await connection.query(`
      CREATE TABLE payment_methods (
        id VARCHAR(36) PRIMARY KEY,
        studentId VARCHAR(36) NOT NULL,
        type ENUM('credit_card', 'paypal', 'bank_account', 'stripe') NOT NULL,
        provider ENUM('paypal', 'stripe', 'manual') NOT NULL,
        token VARCHAR(255),
        lastFour VARCHAR(4),
        expiryDate VARCHAR(7),
        cardBrand VARCHAR(50),
        isDefault BOOLEAN NOT NULL DEFAULT FALSE,
        billingDetails JSON,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_student_id (studentId),
        CONSTRAINT fk_payment_methods_student FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Payment methods table created successfully');

    // Create invoices table
    console.log('Creating invoices table...');
    await connection.query(`
      CREATE TABLE invoices (
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
    console.log('Invoices table created successfully');

    // Update migrations table to mark these migrations as complete
    console.log('Updating migrations table...');
    const migrationNames = [
      'create_payments_table',
      'create_payment_methods_table',
      'create_invoices_table'
    ];

    for (const name of migrationNames) {
      // Check if migration exists
      const [exists] = await connection.query('SELECT * FROM migrations WHERE name = ?', [name]);
      
      if (exists.length > 0) {
        // Update existing record
        await connection.query(
          'UPDATE migrations SET success = TRUE, error_message = NULL WHERE name = ?',
          [name]
        );
      } else {
        // Insert new record
        await connection.query(
          'INSERT INTO migrations (name, success) VALUES (?, TRUE)',
          [name]
        );
      }
    }
    console.log('Migrations table updated successfully');

    console.log('All payment tables created successfully!');
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating payment tables:', error);
    process.exit(1);
  }
}

run(); 