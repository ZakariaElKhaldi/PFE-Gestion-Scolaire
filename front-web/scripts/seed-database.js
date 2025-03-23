#!/usr/bin/env node

/**
 * Database Seeder Script
 * 
 * This script prepares the environment and runs the data generation script
 * to populate the database with test data.
 */

import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
let API_URL = process.env.API_URL || 'http://localhost:3001/api';
const ADMIN_EMAIL = 'admin@school.com';
const ADMIN_PASSWORD = 'Admin123!';

// Flag to track if we're on Windows
const isWindows = process.platform === 'win32';

// Adjust the API URL if needed
const adjustApiUrl = () => {
  // If we're already successfully connecting, keep the URL as is
  if (API_URL.endsWith('/api') && isWindows) {
    // Check if we should try without /api suffix
    const baseUrl = API_URL.slice(0, -4); // Remove /api
    console.log(`On Windows, also trying ${baseUrl}`);
    return baseUrl;
  }
  return API_URL;
};

// Create interface for command line input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Alternative backend URLs to try if the primary one fails
const ALTERNATIVE_URLS = [
  'http://localhost:3001/api',
  'http://localhost:3001', // Try without /api
  'http://localhost:3000/api',
  'http://localhost:3000',
  'http://127.0.0.1:3001/api',
  'http://127.0.0.1:3001',
  'http://localhost:8080/api',
  'http://localhost:8080'
];

/**
 * Check for alternative API URLs if primary URL fails
 */
async function tryAlternativeUrls() {
  console.log('Trying alternative backend URLs...');
  
  for (const url of ALTERNATIVE_URLS) {
    if (url === API_URL) continue; // Skip the already tried URL
    
    try {
      console.log(`Trying ${url}...`);
      const axios = (await import('axios')).default;
      await axios.get(url, { timeout: 3000, validateStatus: () => true });
      console.log(`✅ Backend found at ${url}`);
      
      return new Promise((resolve) => {
        rl.question(`\nFound backend at ${url}. Use this URL instead? (y/n): `, (answer) => {
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            API_URL = url;
            console.log(`Using ${API_URL} for seeding.`);
            resolve(true);
          } else {
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.log(`❌ Backend not found at ${url}`);
    }
  }
  
  return false;
}

/**
 * Check if backend is running
 */
async function checkBackendStatus() {
  try {
    console.log(`Checking if backend is running at ${API_URL}...`);
    
    // First try using axios instead of curl for better compatibility
    try {
      const axios = (await import('axios')).default;
      const response = await axios.get(`${API_URL}/health-check`, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status to avoid throwing error
      });
      
      console.log(`✅ Backend is running. Status: ${response.status}`);
      return true;
    } catch (axiosError) {
      // Try a different endpoint if health-check fails
      try {
        const axios = (await import('axios')).default;
        await axios.get(API_URL, { 
          timeout: 5000,
          validateStatus: () => true // Accept any status to avoid throwing error
        });
        console.log(`✅ Backend is running.`);
        return true;
      } catch (secondError) {
        // If both axios checks fail, try with curl as fallback
        try {
          execSync(`curl -s -o /dev/null -w "%{http_code}" ${API_URL}`, { stdio: 'pipe' });
          console.log('✅ Backend is running (detected with curl).');
          return true;
        } catch (curlError) {
          throw new Error(`Backend connection failed. ${curlError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Backend connection check failed:', error.message);
    
    // Ask user if they want to proceed anyway
    return new Promise((resolve) => {
      rl.question('\nBackend connection check failed. Do you want to proceed anyway? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('Proceeding with seeding despite backend connection issues...');
          resolve(true);
        } else {
          console.log('Please ensure the backend is running at the correct URL.');
          resolve(false);
        }
      });
    });
  }
}

/**
 * Create admin user if it doesn't exist
 */
async function ensureAdminExists() {
  console.log(`\nEnsuring admin user exists (${ADMIN_EMAIL})...`);
  
  try {
    // Import axios
    const axios = (await import('axios')).default;
    
    // First try registering the admin
    try {
      console.log('Attempting to register admin user...');
      const userData = {
        firstName: "Admin",
        lastName: "User",
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: "administrator"
      };
      
      await axios.post(`${API_URL}/auth/register`, userData, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true // Don't throw on error status
      });
      
      console.log('✅ Admin user created successfully.');
    } catch (registerError) {
      // If registration fails, try logging in
      console.log('Admin user might already exist, trying to login...');
      
      try {
        console.log(`Logging in with ${ADMIN_EMAIL}...`);
        const loginData = {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        };
        
        const response = await axios.post(`${API_URL}/auth/login`, loginData, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.data && response.data.data.token) {
          console.log('✅ Admin user exists and credentials are valid.');
          return true;
        } else {
          console.error('❌ Could not verify admin credentials.');
          console.log('Response:', JSON.stringify(response.data, null, 2));
          
          // Try on base URL without /api if we haven't already
          if (API_URL.endsWith('/api')) {
            const baseUrl = adjustApiUrl();
            if (baseUrl !== API_URL) {
              console.log(`Trying on base URL: ${baseUrl}`);
              try {
                const baseResponse = await axios.post(`${baseUrl}/auth/login`, loginData, {
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (baseResponse.data && baseResponse.data.data && baseResponse.data.data.token) {
                  console.log('✅ Admin user exists and credentials are valid on base URL.');
                  // Update the API URL if this worked
                  API_URL = baseUrl;
                  return true;
                }
              } catch (baseError) {
                console.log('Base URL login also failed.');
              }
            }
          }
          
          // Last attempt - check with the user
          return new Promise((resolve) => {
            rl.question('\nCould not verify admin credentials. Would you like to create them manually and proceed? (y/n): ', (answer) => {
              if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                console.log(`\nPlease create an admin user manually with:\n- Email: ${ADMIN_EMAIL}\n- Password: ${ADMIN_PASSWORD}\n`);
                resolve(true);
              } else {
                console.log('Operation cancelled.');
                resolve(false);
              }
            });
          });
        }
      } catch (loginError) {
        console.error('❌ Error logging in as admin:', loginError.message);
        
        // Last attempt - check with the user
        return new Promise((resolve) => {
          rl.question('\nLogin failed. Would you like to create the admin user manually and proceed? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
              console.log(`\nPlease create an admin user manually with:\n- Email: ${ADMIN_EMAIL}\n- Password: ${ADMIN_PASSWORD}\n`);
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error ensuring admin exists:', error.message);
    
    // Last attempt - check with the user
    return new Promise((resolve) => {
      rl.question('\nFailed to create/verify admin user. Would you like to create it manually and proceed? (y/n): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log(`\nPlease create an admin user manually with:\n- Email: ${ADMIN_EMAIL}\n- Password: ${ADMIN_PASSWORD}\n`);
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}

/**
 * Install required dependencies if needed
 */
async function installDependencies() {
  return new Promise((resolve) => {
    console.log('\nChecking for required dependencies...');
    
    // List of required dependencies for the seed script
    const requiredDeps = ['@faker-js/faker', 'axios', 'bcryptjs'];
    
    // Read package.json to check if dependencies are already installed
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const missingDeps = requiredDeps.filter(dep => 
      !packageData.dependencies[dep] && !packageData.devDependencies[dep]
    );
    
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies are already installed.');
      resolve(true);
      return;
    }
    
    console.log(`Missing dependencies: ${missingDeps.join(', ')}`);
    
    rl.question('\nWould you like to install missing dependencies? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log(`Installing: ${missingDeps.join(' ')}`);
        
        const npm = spawn('npm', ['install', '--save-dev', ...missingDeps], {
          cwd: path.join(__dirname, '..'),
          stdio: 'inherit'
        });
        
        npm.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Dependencies installed successfully.');
            resolve(true);
          } else {
            console.error(`❌ Failed to install dependencies (exit code: ${code}).`);
            resolve(false);
          }
        });
      } else {
        console.log('❌ Cannot proceed without required dependencies.');
        resolve(false);
      }
    });
  });
}

/**
 * Run the data generation script
 */
async function runDataGenerator() {
  return new Promise((resolve) => {
    console.log('\nRunning data generation script...');
    console.log(`Using API URL: ${API_URL}`);
    
    const generatorPath = path.join(__dirname, 'generate-fake-data.js');
    
    let stdoutData = '';
    let stderrData = '';
    
    const node = spawn('node', [generatorPath], {
      env: { ...process.env, API_URL: API_URL }
    });
    
    // Capture stdout data
    node.stdout.on('data', (data) => {
      const output = data.toString();
      stdoutData += output;
      process.stdout.write(output);
    });
    
    // Capture stderr data
    node.stderr.on('data', (data) => {
      const output = data.toString();
      stderrData += output;
      process.stderr.write(output);
    });
    
    node.on('close', (code) => {
      if (code === 0 && !stdoutData.includes('Failed to login as admin')) {
        console.log('\n✅ Data generation completed successfully!');
        resolve(true);
      } else {
        console.error('\n❌ Data generation failed.');
        if (stdoutData.includes('Failed to login as admin')) {
          console.error('\nThe admin user could not be authenticated. This could be because:');
          console.error('1. The password might be incorrect or the account is locked');
          console.error('2. The authentication endpoint might be different than expected');
          console.error('3. There might be CORS or other security policies preventing login');
          console.error('\nPlease check your backend logs for more details.');
        }
        resolve(false);
      }
    });
  });
}

/**
 * Verify API endpoints exist and are accessible
 */
async function verifyApiEndpoints() {
  console.log(`\nChecking API endpoints at ${API_URL}...`);
  
  try {
    const axios = (await import('axios')).default;
    
    // Test endpoints to check
    const testEndpoints = [
      '', // Base URL
      '/auth/login',
      '/auth/register'
    ];
    
    let validationMap = {};
    
    // Test each endpoint
    for (const endpoint of testEndpoints) {
      const url = `${API_URL}${endpoint}`;
      try {
        console.log(`Testing endpoint: ${url}`);
        const response = await axios.get(url, {
          validateStatus: () => true,
          timeout: 3000
        });
        
        // Even a 404 means the server is responding
        validationMap[endpoint] = {
          accessible: true,
          status: response.status,
          valid: response.status !== 404 // 404 means endpoint exists but not GET method
        };
        
        console.log(`✅ Endpoint ${url} responded with status ${response.status}`);
      } catch (error) {
        console.error(`❌ Endpoint ${url} error: ${error.message}`);
        validationMap[endpoint] = { accessible: false, error: error.message };
      }
    }
    
    // Check if we found any valid endpoints
    const anyValid = Object.values(validationMap).some(result => result.accessible);
    
    if (anyValid) {
      console.log('API appears to be responding, but some endpoints may not be available.');
      console.log('Endpoint check results:');
      for (const [endpoint, result] of Object.entries(validationMap)) {
        const endpointName = endpoint || '[base URL]';
        console.log(`- ${endpointName}: ${result.accessible ? 'Accessible' : 'Not accessible'} ${result.status ? `(Status: ${result.status})` : ''}`);
      }
      return true;
    } else {
      console.error('❌ No API endpoints are accessible. Please check your API URL and server status.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verifying API endpoints:', error.message);
    return false;
  }
}

/**
 * Main function to run the seeding process
 */
async function runSeeder() {
  console.log('=== School Management System Database Seeder ===\n');
  
  // Print platform info
  console.log(`Platform: ${process.platform}`);
  console.log(`Node version: ${process.version}`);
  
  // Check if backend is running
  const backendRunning = await checkBackendStatus();
  if (!backendRunning) {
    // Try alternative URLs
    const foundAlternative = await tryAlternativeUrls();
    if (!foundAlternative) {
      console.log('\nPlease make sure the backend server is running at the correct URL.');
      console.log('You can specify a custom URL with:');
      console.log('API_URL=http://your-api-url node scripts/seed-database.js');
      
      // Last attempt - ask user to proceed anyway
      const proceed = await new Promise((resolve) => {
        rl.question('\nDo you want to proceed anyway with the current URL? (y/n): ', (answer) => {
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
      });
      
      if (!proceed) {
        rl.close();
        return;
      }
    }
  }
  
  console.log(`\nUsing API URL: ${API_URL}`);
  
  // Verify API endpoints
  await verifyApiEndpoints();
  
  const adminExists = await ensureAdminExists();
  if (!adminExists) {
    console.log('\nPlease ensure the admin user can be created or accessed and try again.');
    rl.close();
    return;
  }
  
  const depsInstalled = await installDependencies();
  if (!depsInstalled) {
    rl.close();
    return;
  }
  
  // Final confirmation before running the generator
  rl.question('\nReady to generate fake data. This will add a large amount of test data to your database. Continue? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      const dataGenSuccess = await runDataGenerator();
      
      if (!dataGenSuccess) {
        console.log('\nTo troubleshoot:');
        console.log('1. Check that the backend server is running and accessible');
        console.log('2. Verify that the admin credentials are correct');
        console.log('3. Check backend logs for more detailed error messages');
        console.log('4. Try manually creating some test data through the admin interface');
      }
    } else {
      console.log('Operation cancelled by user.');
    }
    
    rl.close();
  });
}

// Run the seeder
runSeeder(); 