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

    // Check payments table
    console.log('\nChecking payments table structure:');
    const [paymentRows] = await connection.query('SHOW CREATE TABLE payments');
    console.log(paymentRows[0]['Create Table']);

    // Check payment_methods table
    console.log('\nChecking payment_methods table structure:');
    const [methodRows] = await connection.query('SHOW CREATE TABLE payment_methods');
    console.log(methodRows[0]['Create Table']);

    // Check invoices table
    console.log('\nChecking invoices table structure:');
    const [invoiceRows] = await connection.query('SHOW CREATE TABLE invoices');
    console.log(invoiceRows[0]['Create Table']);
    
    await connection.end();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run(); 