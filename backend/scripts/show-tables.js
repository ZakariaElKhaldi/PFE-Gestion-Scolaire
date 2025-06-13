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

    // Get all tables
    console.log('Getting all tables...');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\nTables in database:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run(); 