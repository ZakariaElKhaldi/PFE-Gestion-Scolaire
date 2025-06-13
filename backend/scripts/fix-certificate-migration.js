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

    console.log('Checking certificate migration status...');
    // Check migration status
    const [rows] = await connection.query("SELECT * FROM migrations WHERE name = 'create_certificates_table'");
    
    if (rows.length === 0) {
      console.log('Certificate migration not found in migrations table!');
    } else {
      console.log(`Found ${rows.length} certificate migration entries.`);
      
      // Update the migration status to successful
      console.log('Updating migration status to successful...');
      await connection.query(`
        UPDATE migrations 
        SET success = TRUE, error_message = NULL 
        WHERE name = 'create_certificates_table'
      `);
      
      console.log('Migration status updated successfully!');
      
      // Verify the update
      const [updatedRows] = await connection.query("SELECT * FROM migrations WHERE name = 'create_certificates_table'");
      console.log('\nUpdated certificate migration status:');
      updatedRows.forEach((row, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`- ID: ${row.id}`);
        console.log(`- Name: ${row.name}`);
        console.log(`- Success: ${row.success ? 'Yes' : 'No'}`);
        console.log(`- Executed At: ${row.executed_at}`);
        if (row.error_message) {
          console.log(`- Error Message: ${row.error_message}`);
        }
      });
    }

    await connection.end();
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Run the script
run(); 