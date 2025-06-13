const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Generate mock payment data for testing
 */
async function seedPayments() {
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

    // Get student IDs from the database
    console.log('Fetching student IDs...');
    const [students] = await connection.query(
      "SELECT id FROM users WHERE role = 'student' LIMIT 10"
    );

    if (students.length === 0) {
      console.log('No students found in the database. Please seed users first.');
      await connection.end();
      return;
    }

    console.log(`Found ${students.length} students`);

    // Delete existing payments data
    console.log('Clearing existing payments data...');
    await connection.query('DELETE FROM invoices');
    await connection.query('DELETE FROM payment_methods');
    await connection.query('DELETE FROM payments');
    console.log('Existing payments data cleared');

    // Generate mock payment data
    console.log('Generating mock payment data...');
    
    const paymentMethods = ['credit_card', 'paypal', 'bank_transfer', 'cash', 'stripe'];
    const paymentGateways = ['paypal', 'stripe', 'manual'];
    const statuses = ['pending', 'completed', 'failed', 'refunded', 'overdue'];
    
    // Create payments for each student
    for (const student of students) {
      const studentId = student.id;
      
      // Generate 5-10 payments per student
      const numPayments = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < numPayments; i++) {
        const paymentId = uuidv4();
        const amount = (Math.random() * 1000 + 50).toFixed(2);
        const description = `Tuition payment for ${['Fall', 'Spring', 'Summer'][Math.floor(Math.random() * 3)]} semester`;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const paymentGateway = paymentGateways[Math.floor(Math.random() * paymentGateways.length)];
        
        // Create dates
        const now = new Date();
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) - 15); // Due date +/- 15 days from now
        
        let paymentDate = null;
        if (status === 'completed' || status === 'refunded') {
          paymentDate = new Date(dueDate);
          paymentDate.setDate(paymentDate.getDate() - Math.floor(Math.random() * 5)); // Payment made 0-5 days before due date
        }
        
        // Insert payment
        await connection.query(
          `INSERT INTO payments (
            id, studentId, amount, description, status, paymentMethod, 
            paymentGateway, transactionId, dueDate, paymentDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            paymentId, 
            studentId, 
            amount, 
            description, 
            status, 
            paymentMethod, 
            paymentGateway, 
            status === 'completed' ? `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
            dueDate.toISOString().split('T')[0],
            paymentDate ? paymentDate.toISOString().split('.')[0].replace('T', ' ') : null
          ]
        );
        
        // Create invoice for this payment
        const invoiceId = uuidv4();
        const invoiceNumber = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${i}`;
        const issueDate = new Date(dueDate);
        issueDate.setDate(issueDate.getDate() - 15); // Issue date 15 days before due date
        
        await connection.query(
          `INSERT INTO invoices (
            id, paymentId, invoiceNumber, studentId, amount, description, 
            status, dueDate, issueDate, paidDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            paymentId,
            invoiceNumber,
            studentId,
            amount,
            description,
            status,
            dueDate.toISOString().split('T')[0],
            issueDate.toISOString().split('T')[0],
            paymentDate ? paymentDate.toISOString().split('.')[0].replace('T', ' ') : null
          ]
        );
      }
      
      // Create 1-2 payment methods per student
      const numMethods = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numMethods; i++) {
        const methodId = uuidv4();
        const type = ['credit_card', 'paypal', 'bank_account'][Math.floor(Math.random() * 3)];
        const provider = type === 'paypal' ? 'paypal' : (type === 'credit_card' ? 'stripe' : 'manual');
        const isDefault = i === 0; // First method is default
        
        let lastFour = null;
        let expiryDate = null;
        let cardBrand = null;
        
        if (type === 'credit_card') {
          lastFour = Math.floor(1000 + Math.random() * 9000).toString();
          
          const month = Math.floor(Math.random() * 12) + 1;
          const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
          expiryDate = `${month.toString().padStart(2, '0')}/${year.toString().substring(2)}`;
          
          cardBrand = ['Visa', 'Mastercard', 'Amex', 'Discover'][Math.floor(Math.random() * 4)];
        }
        
        await connection.query(
          `INSERT INTO payment_methods (
            id, studentId, type, provider, token, lastFour, 
            expiryDate, cardBrand, isDefault
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            methodId,
            studentId,
            type,
            provider,
            `tok_${Math.random().toString(36).substring(2, 15)}`,
            lastFour,
            expiryDate,
            cardBrand,
            isDefault
          ]
        );
      }
    }

    console.log('Mock payment data generated successfully!');
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding payments:', error);
    process.exit(1);
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedPayments()
    .then(() => {
      console.log('Payment seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Payment seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedPayments; 