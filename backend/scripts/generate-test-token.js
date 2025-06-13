const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Create a payload for an admin user
const payload = {
  userId: '123456789', // Mock user ID
  role: 'admin',
  iat: Math.floor(Date.now() / 1000)
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET);

console.log('Generated JWT Token:');
console.log(token);
console.log('\nUse this token for testing the API endpoints.');
console.log('\nExample curl command:');
console.log(`curl -X GET http://localhost:3001/api/payments/all -H "Authorization: Bearer ${token}"`);
console.log('\nExample PowerShell command:');
console.log(`Invoke-WebRequest -Uri http://localhost:3001/api/payments/all -Headers @{Authorization="Bearer ${token}"} -Method GET | Select-Object -ExpandProperty Content`); 