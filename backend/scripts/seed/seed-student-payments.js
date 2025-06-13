const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Generate payment data specifically for Student Johnson
 */
async function seedStudentPayments() {
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

    // Student Johnson's ID
    const studentId = 'f4b969e2-324a-4333-9624-d016a54ea06d';
    
    // First, verify the student exists
    const [studentCheck] = await connection.query(
      "SELECT id, firstName, lastName FROM users WHERE id = ?",
      [studentId]
    );

    if (studentCheck.length === 0) {
      console.log('Student not found in the database.');
      await connection.end();
      return;
    }

    console.log(`Found student: ${studentCheck[0].firstName} ${studentCheck[0].lastName}`);

    // Delete existing payment data for this student
    console.log('Clearing existing payment data for this student...');
    await connection.query('DELETE FROM invoices WHERE studentId = ?', [studentId]);
    await connection.query('DELETE FROM payment_methods WHERE studentId = ?', [studentId]);
    await connection.query('DELETE FROM payments WHERE studentId = ?', [studentId]);
    console.log('Existing payment data cleared');

    // Generate payment data
    console.log('Generating payment data...');
    
    // Create payment methods
    const creditCardId = uuidv4();
    const paypalId = uuidv4();
    
    // Credit card payment method
    await connection.query(
      `INSERT INTO payment_methods (
        id, studentId, type, provider, token, lastFour, 
        expiryDate, cardBrand, isDefault
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        creditCardId,
        studentId,
        'credit_card',
        'stripe',
        `tok_${Math.random().toString(36).substring(2, 15)}`,
        '4242',
        '12/25',
        'Visa',
        1 // Default payment method
      ]
    );
    console.log('Added credit card payment method');
    
    // PayPal payment method
    await connection.query(
      `INSERT INTO payment_methods (
        id, studentId, type, provider, token, lastFour, 
        expiryDate, cardBrand, isDefault
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paypalId,
        studentId,
        'paypal',
        'paypal',
        `tok_${Math.random().toString(36).substring(2, 15)}`,
        null,
        null,
        null,
        0
      ]
    );
    console.log('Added PayPal payment method');

    // Create payments with different statuses
    const payments = [
      {
        amount: 500.00,
        description: 'Tuition payment for Fall semester',
        status: 'completed',
        method: 'credit_card',
        gateway: 'stripe',
        dueDays: -30, // Due 30 days ago
        paid: true
      },
      {
        amount: 350.50,
        description: 'Laboratory fees',
        status: 'completed',
        method: 'paypal',
        gateway: 'paypal',
        dueDays: -15, // Due 15 days ago
        paid: true
      },
      {
        amount: 200.00,
        description: 'Books and materials',
        status: 'pending',
        method: 'credit_card',
        gateway: 'stripe',
        dueDays: 5, // Due in 5 days
        paid: false
      },
      {
        amount: 750.00,
        description: 'Tuition payment for Spring semester',
        status: 'overdue',
        method: 'credit_card',
        gateway: 'stripe',
        dueDays: -10, // Due 10 days ago
        paid: false
      },
      {
        amount: 125.75,
        description: 'Field trip fees',
        status: 'pending',
        method: 'paypal',
        gateway: 'paypal',
        dueDays: 15, // Due in 15 days
        paid: false
      }
    ];

    // Insert payments and invoices
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const paymentId = uuidv4();
      
      // Calculate dates
      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + payment.dueDays);
      
      let paymentDate = null;
      if (payment.paid) {
        paymentDate = new Date(dueDate);
        paymentDate.setDate(paymentDate.getDate() - 2); // Payment made 2 days before due date
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
          payment.amount, 
          payment.description, 
          payment.status, 
          payment.method, 
          payment.gateway, 
          payment.paid ? `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
          dueDate.toISOString().split('T')[0],
          paymentDate ? paymentDate.toISOString().split('.')[0].replace('T', ' ') : null
        ]
      );
      
      // Create invoice for this payment
      const invoiceId = uuidv4();
      const invoiceNumber = `INV-STJ-${i+1}`;
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
          payment.amount,
          payment.description,
          payment.status,
          dueDate.toISOString().split('T')[0],
          issueDate.toISOString().split('T')[0],
          paymentDate ? paymentDate.toISOString().split('.')[0].replace('T', ' ') : null
        ]
      );
      
      console.log(`Added payment: ${payment.description} (${payment.status})`);
    }

    console.log('Student payment data generated successfully!');
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding student payments:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedStudentPayments()
  .then(() => {
    console.log('Student payment seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Student payment seeding failed:', error);
    process.exit(1);
  }); 