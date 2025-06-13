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

    // Get CREATE TABLE statement
    console.log('Getting CREATE TABLE statement for users table...');
    const [rows] = await connection.query('SHOW CREATE TABLE users');
    
    if (rows.length > 0) {
      console.log('\nCREATE TABLE statement for users table:');
      console.log(rows[0]['Create Table']);
    } else {
      console.log('Users table not found!');
    }
    
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run(); 