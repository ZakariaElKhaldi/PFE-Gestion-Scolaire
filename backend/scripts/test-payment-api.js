const axios = require('axios');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Generate a valid token
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const payload = {
  userId: '123456789',
  role: 'admin',
  iat: Math.floor(Date.now() / 1000)
};
const token = jwt.sign(payload, JWT_SECRET);

console.log('Using JWT Token:', token);

// Base URL for API
const baseUrl = 'http://localhost:3001/api';

// Headers with authorization
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Get a valid student ID from the database
async function getValidStudentId() {
  try {
    // Create a database connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });

    // Query to find a student user
    const [rows] = await connection.execute(`
      SELECT id FROM users 
      WHERE role = 'student' 
      LIMIT 1
    `);

    await connection.end();

    if (rows.length > 0) {
      console.log('Found valid student ID:', rows[0].id);
      return rows[0].id;
    }

    // If no student found, try to find any user
    const conn2 = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'pfe'
    });

    const [anyUsers] = await conn2.execute(`
      SELECT id FROM users 
      LIMIT 1
    `);

    await conn2.end();

    if (anyUsers.length > 0) {
      console.log('No students found. Using user ID:', anyUsers[0].id);
      return anyUsers[0].id;
    }

    console.log('No users found in database. Using mock ID.');
    return '123456789';
  } catch (error) {
    console.error('Error getting valid student ID:', error.message);
    return '123456789';
  }
}

// Test functions
async function testGetAllPayments() {
  try {
    console.log('\n1. Testing GET /payments/all');
    const response = await axios.get(`${baseUrl}/payments/all`, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testCreatePayment(studentId) {
  try {
    console.log('\n2. Testing POST /payments');
    const paymentData = {
      studentId,
      amount: 100.00,
      description: 'Test payment',
      paymentMethod: 'credit_card',
      dueDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('Payment data:', JSON.stringify(paymentData, null, 2));
    const response = await axios.post(`${baseUrl}/payments`, paymentData, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testGetPaymentById(paymentId) {
  try {
    console.log(`\n3. Testing GET /payments/${paymentId}`);
    const response = await axios.get(`${baseUrl}/payments/${paymentId}`, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testProcessPayment(paymentId) {
  try {
    console.log(`\n4. Testing POST /payments/${paymentId}/process-payment`);
    const response = await axios.post(`${baseUrl}/payments/${paymentId}/process-payment`, {}, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testGenerateInvoice(paymentId) {
  try {
    console.log(`\n5. Testing POST /payments/${paymentId}/generate-invoice`);
    const response = await axios.post(`${baseUrl}/payments/${paymentId}/generate-invoice`, {}, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testGetStudentPaymentMethods(studentId) {
  try {
    console.log(`\n6. Testing GET /payments/student/${studentId}/payment-methods`);
    const response = await axios.get(`${baseUrl}/payments/student/${studentId}/payment-methods`, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testCreatePaymentMethod(studentId) {
  try {
    console.log('\n7. Testing POST /payments/payment-methods');
    const methodData = {
      studentId,
      type: 'credit_card',
      provider: 'stripe',
      lastFour: '4242',
      expiryDate: '12/25',
      cardBrand: 'Visa',
      isDefault: true
    };
    
    console.log('Payment method data:', JSON.stringify(methodData, null, 2));
    const response = await axios.post(`${baseUrl}/payments/payment-methods`, methodData, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testGetStudentSubscriptions(studentId) {
  try {
    console.log(`\n8. Testing GET /payments/student/${studentId}/subscriptions`);
    const response = await axios.get(`${baseUrl}/payments/student/${studentId}/subscriptions`, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

async function testCreateSubscription(studentId) {
  try {
    console.log('\n9. Testing POST /payments/subscriptions');
    const subscriptionData = {
      studentId,
      name: 'Test Subscription',
      description: 'Monthly subscription for testing',
      amount: 50.00,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      nextBillingDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('Subscription data:', JSON.stringify(subscriptionData, null, 2));
    const response = await axios.post(`${baseUrl}/payments/subscriptions`, subscriptionData, { headers });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  try {
    console.log('=== STARTING PAYMENT API TESTS ===');
    
    // Get a valid student ID
    const studentId = await getValidStudentId();
    
    // Test getting all payments
    const paymentsResponse = await testGetAllPayments();
    
    // Test creating a payment
    const newPaymentResponse = await testCreatePayment(studentId);
    
    let paymentId = null;
    if (newPaymentResponse && newPaymentResponse.data && newPaymentResponse.data.id) {
      paymentId = newPaymentResponse.data.id;
      
      // Test getting payment by ID
      await testGetPaymentById(paymentId);
      
      // Test processing payment
      await testProcessPayment(paymentId);
      
      // Test generating invoice
      await testGenerateInvoice(paymentId);
    } else {
      console.log('\nSkipping payment-specific tests as payment creation failed');
    }
    
    // Test payment methods
    await testGetStudentPaymentMethods(studentId);
    await testCreatePaymentMethod(studentId);
    
    // Test subscriptions
    await testGetStudentSubscriptions(studentId);
    await testCreateSubscription(studentId);
    
    console.log('\n=== PAYMENT API TESTS COMPLETED ===');
  } catch (error) {
    console.error('\nError running tests:', error);
  }
}

// Run the tests
runTests(); 