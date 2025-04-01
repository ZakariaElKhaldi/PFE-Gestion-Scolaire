import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
}

// Utility to read the JWT token from a file
const getAuthToken = (): string | null => {
  try {
    // Create tokens directory if it doesn't exist
    const tokenDir = path.join(__dirname, '../../tokens');
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir);
    }
    
    const tokenPath = path.join(tokenDir, 'student-token.txt');
    
    // If the token file doesn't exist, create a login token first
    if (!fs.existsSync(tokenPath)) {
      console.log('No token file found. You need to create a token first.');
      console.log('Creating token for student@school.com...');
      return null;
    }
    
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    return token;
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
};

// Create a token by logging in
const createToken = async (): Promise<string | null> => {
  try {
    console.log('Logging in with student@school.com...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'student@school.com',
      password: 'password123'
    });
    
    console.log('Login response:', response.status);
    console.log('Login data:', response.data);
    
    // Check if token exists in response
    if (!response.data || !response.data.token) {
      console.error('No token in response data:', response.data);
      return null;
    }
    
    const token = response.data.token;
    
    // Save the token to a file
    const tokenDir = path.join(__dirname, '../../tokens');
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir);
    }
    
    const tokenPath = path.join(tokenDir, 'student-token.txt');
    fs.writeFileSync(tokenPath, token);
    
    console.log('Token created and saved to token file');
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Error details:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', error.response?.data);
    }
    
    return null;
  }
};

// Test the student courses API directly
const testStudentCoursesApi = async (): Promise<void> => {
  try {
    // Get the token
    let token = getAuthToken();
    
    if (!token) {
      console.log('No existing token found. Creating new token...');
      token = await createToken();
      
      if (!token) {
        console.log('Failed to create auth token. Exiting...');
        return;
      }
    }
    
    console.log('Using token:', token.substring(0, 20) + '...');
    
    // Make the API request
    console.log('Making API request to: http://localhost:3001/api/students/courses');
    
    const response = await axios.get('http://localhost:3001/api/students/courses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log the response
    console.log('API response status:', response.status);
    console.log('API response data:', JSON.stringify(response.data, null, 2));
    
    // Check if there are courses
    if (response.data.courses && response.data.courses.length) {
      console.log(`Found ${response.data.courses.length} courses.`);
      response.data.courses.forEach((course: Course, index: number) => {
        console.log(`Course ${index + 1}: ${course.name} (ID: ${course.id})`);
      });
    } else {
      console.log('No courses found in API response.');
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
  }
};

// Run the test
testStudentCoursesApi()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed with error:', err)); 