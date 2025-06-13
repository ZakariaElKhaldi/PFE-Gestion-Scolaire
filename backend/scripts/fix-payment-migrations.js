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

    // Check if the migrations table exists
    console.log('Checking migrations table...');
    const [tables] = await connection.query("SHOW TABLES LIKE 'migrations'");
    if (tables.length === 0) {
      console.log('Migrations table does not exist!');
      await connection.end();
      return;
    }

    // Check payment-related migrations
    const paymentMigrations = [
      'create_payments_table',
      'create_payment_methods_table',
      'create_invoices_table'
    ];

    for (const migration of paymentMigrations) {
      console.log(`Checking migration: ${migration}`);
      const [rows] = await connection.query('SELECT * FROM migrations WHERE name = ?', [migration]);
      
      if (rows.length > 0) {
        console.log(`Found migration entry for ${migration}. Removing it to allow fresh migration...`);
        await connection.query('DELETE FROM migrations WHERE name = ?', [migration]);
        console.log(`Removed migration entry for ${migration}`);
      } else {
        console.log(`No migration entry found for ${migration}`);
      }
    }

    // Check if the payment tables exist and drop them if they do
    console.log('Checking payment tables...');
    const paymentTables = ['invoices', 'payment_methods', 'payments'];
    
    for (const table of paymentTables) {
      const [tableExists] = await connection.query(`SHOW TABLES LIKE '${table}'`);
      
      if (tableExists.length > 0) {
        console.log(`Found table: ${table}. Dropping it to allow fresh migration...`);
        await connection.query(`DROP TABLE IF EXISTS ${table}`);
        console.log(`Dropped table: ${table}`);
      } else {
        console.log(`Table ${table} does not exist`);
      }
    }

    console.log('Payment migrations and tables have been reset. You can now run the migrations again.');
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run(); 