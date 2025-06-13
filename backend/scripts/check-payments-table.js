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

    console.log('Checking if payments table exists...');
    // Check if table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'payments'");
    if (tables.length === 0) {
      console.log('Payments table does not exist!');
    } else {
      console.log('Payments table exists!');

      // Get table structure
      console.log('Checking payments table structure...');
      const [columns] = await connection.query('SHOW COLUMNS FROM payments');
      
      console.log('\nPayments table structure:');
      columns.forEach(column => {
        console.log(`- ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key === 'PRI' ? '(Primary Key)' : ''}`);
      });

      // Check foreign keys
      console.log('\nChecking foreign keys...');
      const [foreignKeys] = await connection.query(`
        SELECT
          CONSTRAINT_NAME,
          TABLE_NAME,
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE
          TABLE_SCHEMA = '${process.env.DB_NAME || 'pfe'}' AND
          TABLE_NAME = 'payments' AND
          REFERENCED_TABLE_NAME IS NOT NULL;
      `);

      if (foreignKeys.length === 0) {
        console.log('No foreign keys found in payments table.');
      } else {
        console.log('Foreign keys in payments table:');
        foreignKeys.forEach(fk => {
          console.log(`- ${fk.CONSTRAINT_NAME}: ${fk.COLUMN_NAME} references ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
        });
      }
    }

    await connection.end();
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Run the script
run(); 