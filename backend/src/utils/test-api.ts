import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Function to login and return the token
async function login(email: string, password: string): Promise<string | null> {
  try {
    console.log(`Logging in with ${email}...`);
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    console.log('Login response status:', response.status);
    
    // The token is nested inside data.data.token
    if (response.data && response.data.data && response.data.data.token) {
      console.log('Token received from nested response');
      return response.data.data.token;
    }
    
    console.log('Full login response:', JSON.stringify(response.data, null, 2));
    return null;
  } catch (error) {
    console.error('Login error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return null;
  }
}

// Function to get student courses
async function getStudentCourses(token: string) {
  try {
    console.log('Getting student courses...');
    console.log('Using token:', token.substring(0, 30) + '...');
    
    const response = await axios.get(`${API_URL}/students/courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Courses response status:', response.status);
    console.log('Courses data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.courses) {
      console.log(`Found ${response.data.courses.length} courses`);
      
      response.data.courses.forEach((course: any, index: number) => {
        console.log(`Course ${index + 1}: ${course.name} (ID: ${course.id})`);
      });
    } else {
      console.log('No courses found in API response');
    }
  } catch (error) {
    console.error('Error getting courses:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Main function
async function testApi() {
  try {
    // Login
    const token = await login('student@school.com', 'password123');
    
    if (!token) {
      console.error('Failed to get token. Exiting...');
      return;
    }
    
    // Get student courses
    await getStudentCourses(token);
  } catch (error) {
    console.error('Error in test sequence:', error);
  }
}

// Run the test
testApi()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 