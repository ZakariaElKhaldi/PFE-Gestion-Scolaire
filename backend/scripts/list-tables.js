const mysql = require('mysql2/promise');
require('dotenv').config();

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

    console.log('Listing all tables in the database...');

    // Query all tables
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\nTables in database:');
    tables.forEach(table => {
      // Extract table name from the object
      const tableName = Object.values(table)[0];
      console.log(`- ${tableName}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the script
run(); 