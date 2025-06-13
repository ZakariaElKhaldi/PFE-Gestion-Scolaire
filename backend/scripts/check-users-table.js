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

    // Get table structure
    console.log('Checking users table structure...');
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    
    console.log('\nUsers table structure:');
    columns.forEach(column => {
      console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key === 'PRI' ? '(Primary Key)' : ''}`);
    });

    // Check foreign keys referencing users table
    console.log('\nChecking tables with foreign keys to users table...');
    const [foreignKeys] = await connection.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = '${process.env.DB_NAME || 'pfe'}' AND
        REFERENCED_TABLE_NAME = 'users';
    `);

    if (foreignKeys.length === 0) {
      console.log('No foreign keys found referencing users table.');
    } else {
      console.log('Tables with foreign keys to users table:');
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.TABLE_NAME}.${fk.COLUMN_NAME} references users.${fk.REFERENCED_COLUMN_NAME} (Constraint: ${fk.CONSTRAINT_NAME})`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Run the script
run(); 