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

    console.log('Checking if migrations table exists...');
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'migrations'");
    if (tables.length === 0) {
      console.log('Migrations table does not exist!');
      await connection.end();
      return;
    }
    console.log('Migrations table exists!');

    try {
      console.log('Checking migrations table structure...');
      // Get table structure
      const [columns] = await connection.query('SHOW COLUMNS FROM migrations');
      
      console.log('\nMigrations table structure:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key === 'PRI' ? '(Primary Key)' : ''}`);
      });
    } catch (error) {
      console.error('Error getting table structure:', error.message);
    }

    try {
      // Check migrations in the table
      console.log('\nFetching migrations from the table...');
      const [migrations] = await connection.query('SELECT * FROM migrations ORDER BY executed_at DESC');
      
      console.log(`Found ${migrations.length} migrations:`);
      
      migrations.forEach((migration, index) => {
        console.log(`\nMigration ${index + 1}:`);
        console.log(`- Name: ${migration.name}`);
        console.log(`- Success: ${migration.success ? 'Yes' : 'No'}`);
        console.log(`- Executed At: ${migration.executed_at}`);
      });
    } catch (error) {
      console.error('Error querying migrations:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Run the script
run(); 