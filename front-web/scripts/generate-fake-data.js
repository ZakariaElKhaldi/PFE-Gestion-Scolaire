// Script to generate fake data for the school management application

import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import bcrypt from 'bcryptjs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
const ADMIN_EMAIL = 'admin@school.com';
const ADMIN_PASSWORD = 'Admin123!';

// Output API URL for debugging
console.log(`Using API URL: ${API_BASE_URL}`);

// Detect if we're on Windows
const isWindows = process.platform === 'win32';
if (isWindows) {
  console.log('Running on Windows platform');
}

// Quantities
const NUM_DEPARTMENTS = 5;
const NUM_TEACHERS = 20;
const NUM_STUDENTS = 100;
const NUM_PARENTS = 50;
const NUM_COURSES = 30;
const NUM_MATERIALS_PER_COURSE = 5;
const NUM_ASSIGNMENTS_PER_COURSE = 5;
const NUM_ATTENDANCE_RECORDS = 30; // days of attendance to generate
const NUM_ANNOUNCEMENTS = 20;
const NUM_EVENTS = 15;
const NUM_DOCUMENTS = 40;
const NUM_FEEDBACKS = 30;
const NUM_CLASS_SCHEDULES = 20;
const NUM_CLASSES = 15;
const NUM_LOGIN_ATTEMPTS = 10; // For demo purposes
const NUM_PARENT_RELATIONSHIPS = 70;

// Create authentication token variable
let authToken = '';

// Additional fake data arrays for new tables
const documents = [];
const departments = [];
const feedbacks = [];
const classSchedules = [];
const classes = [];
const loginAttempts = [];

// Fake data arrays
const teachers = [];
const students = [];
const parents = [];
const courses = [];
const materials = [];
const assignments = [];
const grades = [];
const attendanceRecords = [];
const announcements = [];
const events = [];

// Helper functions
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate a hash for password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Setup API client with auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Update auth token for API calls
const updateAuthToken = (token) => {
  authToken = token;
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login as admin
async function loginAsAdmin() {
  try {
    console.log('Logging in as admin...');
    console.log(`Attempting login at: ${API_BASE_URL}/auth/login`);
    
    // Debug: Show what credentials we're using
    console.log(`Using credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD.slice(0, 3)}${'*'.repeat(ADMIN_PASSWORD.length - 3)}`);
    
    // Try to see if we can make any request to the server first
    try {
      console.log('Testing API connection...');
      const testResponse = await axios.get(`${API_BASE_URL}`, { 
        validateStatus: () => true,
        timeout: 5000
      });
      console.log(`API connection test result: ${testResponse.status} ${testResponse.statusText}`);
    } catch (testError) {
      console.error('API connection test failed:', testError.message);
    }
    
    // Try with the provided URL first
    try {
      console.log('Sending login request...');
      const loginData = {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      };
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true // Don't throw on error status
      });
      
      console.log(`Login response status: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        console.error('Authentication failed (401): Invalid credentials or user does not exist');
        console.log('Debugging response:', response.data);
        
        // Try registering the admin again
        console.log('Attempting to register admin user again...');
        try {
          const userData = {
            firstName: "Admin",
            lastName: "User",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "administrator"
          };
          
          const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, userData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
          });
          
          console.log(`Registration response: ${registerResponse.status} ${registerResponse.statusText}`);
          console.log('Registration data:', registerResponse.data);
          
          // Try login again after registration
          const secondLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true
          });
          
          if (secondLoginResponse.status === 200 && secondLoginResponse.data?.data?.token) {
            updateAuthToken(secondLoginResponse.data.data.token);
            console.log('Successfully logged in after re-registration');
            return true;
          }
        } catch (registerError) {
          console.error('Admin registration failed:', registerError.message);
        }
      }
      
      if (response.data && response.data.data && response.data.data.token) {
        updateAuthToken(response.data.data.token);
        console.log('Successfully logged in as admin');
        return true;
      } else {
        console.log('Login response did not contain token:', JSON.stringify(response.data, null, 2));
        throw new Error('Login response did not contain token');
      }
    } catch (firstError) {
      console.error('Initial login attempt failed:', firstError.message);
      
      // If URL ends with /api, try without it
      if (API_BASE_URL.endsWith('/api')) {
        const baseUrl = API_BASE_URL.slice(0, -4); // Remove /api
        console.log(`Trying login at: ${baseUrl}/auth/login`);
        
        try {
          const response = await axios.post(`${baseUrl}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          });
          
          if (response.data && response.data.data && response.data.data.token) {
            updateAuthToken(response.data.data.token);
            console.log('Successfully logged in as admin using alternate URL');
            return true;
          }
        } catch (secondError) {
          console.error('Alternative login also failed:', secondError.message);
        }
      }

      // Try checking available routes
      try {
        console.log('Checking available API routes...');
        const optionsResponse = await axios.options(API_BASE_URL, {
          validateStatus: () => true,
          timeout: 3000
        });
        console.log('Available routes info:', optionsResponse.headers);
      } catch (optionsError) {
        console.log('Could not check available routes:', optionsError.message);
      }
      
      throw new Error('All login attempts failed');
    }
  } catch (error) {
    console.error('Login failed:', error.message);
    return false;
  }
}

// Generate departments
async function generateDepartments() {
  console.log('Generating departments...');
  
  const departmentNames = [
    'Mathematics', 
    'Science', 
    'Languages', 
    'Social Studies', 
    'Arts', 
    'Physical Education',
    'Computer Science',
    'Business Studies'
  ];
  
  for (let i = 0; i < NUM_DEPARTMENTS; i++) {
    try {
      const departmentData = {
        name: departmentNames[i] || `${faker.word.adjective()} Department`,
        description: faker.lorem.paragraph(),
        code: faker.string.alphanumeric(4).toUpperCase(),
        head: null, // Will be updated later with a teacher
      };
      
      const response = await apiClient.post('/admin/departments', departmentData);
      departments.push(response.data.data);
      console.log(`Created department: ${departmentData.name}`);
    } catch (error) {
      console.error('Error creating department:', error.response?.data?.message || error.message);
    }
  }
}

// Generate teachers
async function generateTeachers() {
  console.log('Generating teachers...');
  
  for (let i = 0; i < NUM_TEACHERS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.person.sex();
    
    try {
      const teacherData = {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'school.com' }).toLowerCase(),
        password: 'Teacher123!',
        role: 'teacher',
        phoneNumber: faker.phone.number(),
        gender,
        department: getRandomItem(departments)?._id,
        subjects: [],
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        },
        dateOfBirth: faker.date.birthdate({ min: 25, max: 65, mode: 'age' }),
        joinDate: faker.date.past({ years: 10 }),
        qualifications: [
          `${faker.person.jobType()} Degree`,
          `${faker.person.jobArea()} Certification`
        ],
        bio: faker.lorem.paragraph()
      };
      
      const response = await apiClient.post('/admin/teachers', teacherData);
      teachers.push(response.data.data);
      console.log(`Created teacher: ${firstName} ${lastName}`);
    } catch (error) {
      console.error(`Error creating teacher:`, error.response?.data?.message || error.message);
    }
  }
  
  // Assign department heads
  for (const department of departments) {
    const departmentTeachers = teachers.filter(t => t.department === department._id);
    if (departmentTeachers.length > 0) {
      const head = getRandomItem(departmentTeachers);
      try {
        await apiClient.patch(`/admin/departments/${department._id}`, { head: head._id });
        console.log(`Assigned ${head.firstName} ${head.lastName} as head of ${department.name}`);
      } catch (error) {
        console.error('Error assigning department head:', error.response?.data?.message || error.message);
      }
    }
  }
}

// Generate students
async function generateStudents() {
  console.log('Generating students...');
  
  const gradeNames = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
  
  for (let i = 0; i < NUM_STUDENTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.person.sex();
    
    try {
      const studentData = {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'student.school.com' }).toLowerCase(),
        password: 'Student123!',
        role: 'student',
        phoneNumber: faker.phone.number(),
        gender,
        grade: getRandomItem(gradeNames),
        enrollmentDate: faker.date.past({ years: 4 }),
        dateOfBirth: faker.date.birthdate({ min: 14, max: 20, mode: 'age' }),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        }
      };
      
      const response = await apiClient.post('/admin/students', studentData);
      students.push(response.data.data);
      console.log(`Created student: ${firstName} ${lastName}`);
    } catch (error) {
      console.error(`Error creating student:`, error.response?.data?.message || error.message);
    }
  }
}

// Generate parents
async function generateParents() {
  console.log('Generating parents...');
  
  // Distribute students among parents (some have multiple children)
  const studentsToAssign = [...students];
  
  for (let i = 0; i < NUM_PARENTS; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const gender = faker.person.sex();
    
    try {
      const parentData = {
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName, provider: 'parent.school.com' }).toLowerCase(),
        password: 'Parent123!',
        role: 'parent',
        phoneNumber: faker.phone.number(),
        gender,
        occupation: faker.person.jobTitle(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country()
        }
      };
      
      // Assign 1-3 students to each parent
      const numChildren = Math.min(Math.floor(Math.random() * 3) + 1, studentsToAssign.length);
      const children = [];
      
      for (let j = 0; j < numChildren && studentsToAssign.length > 0; j++) {
        // Take a random student from the remaining ones
        const randomIndex = Math.floor(Math.random() * studentsToAssign.length);
        const child = studentsToAssign.splice(randomIndex, 1)[0];
        children.push(child._id);
      }
      
      parentData.children = children;
      
      const response = await apiClient.post('/admin/parents', parentData);
      parents.push(response.data.data);
      console.log(`Created parent: ${firstName} ${lastName} with ${children.length} children`);
    } catch (error) {
      console.error(`Error creating parent:`, error.response?.data?.message || error.message);
    }
  }
}

// Generate courses
async function generateCourses() {
  console.log('Generating courses...');
  
  const subjectNames = [
    'Advanced Mathematics', 'Algebra', 'Geometry', 'Calculus',
    'Physics', 'Chemistry', 'Biology', 'Environmental Science',
    'English Literature', 'Creative Writing', 'Spanish', 'French',
    'World History', 'U.S. History', 'Geography', 'Economics',
    'Art Appreciation', 'Music Theory', 'Drama', 'Photography',
    'Physical Education', 'Health', 'Nutrition',
    'Computer Science', 'Programming', 'Web Development', 'Data Science',
    'Business Management', 'Accounting', 'Marketing'
  ];
  
  for (let i = 0; i < NUM_COURSES; i++) {
    try {
      // Assign a department based on the subject
      const subjectName = subjectNames[i % subjectNames.length];
      const department = departments[i % departments.length];
      
      const teachersInDept = teachers.filter(t => t.department === department._id);
      const instructor = teachersInDept.length > 0 
        ? getRandomItem(teachersInDept) 
        : getRandomItem(teachers);
      
      // Assign 15-30 students per course
      const numStudentsInCourse = Math.floor(Math.random() * 15) + 15;
      const courseStudents = getRandomItems(students, numStudentsInCourse).map(s => s._id);
      
      const courseData = {
        name: subjectName,
        code: `${department.code}-${faker.string.alphanumeric(3).toUpperCase()}`,
        description: faker.lorem.paragraph(),
        department: department._id,
        instructor: instructor._id,
        students: courseStudents,
        credits: Math.floor(Math.random() * 3) + 1,
        schedule: {
          days: getRandomItems(['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
                              Math.floor(Math.random() * 3) + 1),
          startTime: `${Math.floor(Math.random() * 8) + 8}:00`,
          endTime: `${Math.floor(Math.random() * 8) + 13}:00`,
          room: `${faker.string.alpha(1).toUpperCase()}-${faker.number.int({min: 100, max: 999})}`
        },
        startDate: faker.date.recent({days: 60}),
        endDate: faker.date.soon({days: 120}),
        maxCapacity: numStudentsInCourse + Math.floor(Math.random() * 10),
      };
      
      const response = await apiClient.post('/admin/courses', courseData);
      courses.push(response.data.data);
      console.log(`Created course: ${courseData.name} (${courseData.code})`);
    } catch (error) {
      console.error(`Error creating course:`, error.response?.data?.message || error.message);
    }
  }
}

// Generate materials
async function generateMaterials() {
  console.log('Generating course materials...');
  
  const materialTypes = ['document', 'video', 'quiz', 'assignment', 'presentation', 'reading'];
  const formats = ['pdf', 'docx', 'pptx', 'mp4', 'link', 'text', 'html', 'epub'];
  
  for (const course of courses) {
    for (let i = 0; i < NUM_MATERIALS_PER_COURSE; i++) {
      try {
        const type = getRandomItem(materialTypes);
        const format = getRandomItem(formats);
        
        const materialData = {
          courseId: course._id,
          title: `${course.name} - ${faker.word.noun()} ${faker.commerce.productAdjective()}`,
          type,
          format,
          description: faker.lorem.paragraph(),
          uploadedBy: course.instructor,
          uploadDate: faker.date.recent({days: 30}),
          fileUrl: faker.internet.url(),
          fileSize: Math.floor(Math.random() * 10000000), // Random file size in bytes
          duration: type === 'video' ? Math.floor(Math.random() * 60) + 10 : undefined, // Duration in minutes for videos
          status: getRandomItem(['active', 'draft', 'archived']),
          visibility: getRandomItem(['all', 'enrolled', 'instructors']),
          tags: faker.helpers.arrayElements(['important', 'exam', 'required', 'optional'], 
                                          Math.floor(Math.random() * 3) + 1),
          order: i + 1,
          accessRestrictions: {
            startDate: Math.random() > 0.7 ? faker.date.recent({days: 5}) : null,
            endDate: Math.random() > 0.7 ? faker.date.soon({days: 14}) : null,
            requiresPassword: Math.random() > 0.9,
            password: Math.random() > 0.9 ? faker.internet.password() : null
          }
        };
        
        const response = await apiClient.post('/materials', materialData);
        materials.push(response.data.data);
        console.log(`Created material: ${materialData.title} for ${course.name}`);
      } catch (error) {
        console.error(`Error creating material:`, error.response?.data?.message || error.message);
      }
    }
  }
}

// Generate assignments
async function generateAssignments() {
  console.log('Generating assignments...');
  
  const assignmentTypes = ['essay', 'problem_set', 'project', 'quiz', 'test', 'presentation'];
  
  for (const course of courses) {
    for (let i = 0; i < NUM_ASSIGNMENTS_PER_COURSE; i++) {
      try {
        const assignmentData = {
          courseId: course._id,
          title: `${course.name} - ${faker.word.adjective()} ${getRandomItem(assignmentTypes)}`,
          description: faker.lorem.paragraphs(2),
          dueDate: faker.date.soon({days: 14}),
          totalPoints: Math.floor(Math.random() * 50) + 50, // 50-100 points
          type: getRandomItem(assignmentTypes),
          instructions: faker.lorem.paragraphs(3),
          attachments: [],
          createdBy: course.instructor,
        };
        
        const response = await apiClient.post('/assignments', assignmentData);
        const assignment = response.data.data;
        assignments.push(assignment);
        console.log(`Created assignment: ${assignmentData.title} for ${course.name}`);
        
        // Generate grades for some students
        const courseStudents = students.filter(s => course.students.includes(s._id));
        for (const student of courseStudents) {
          // Only 70% of students have grades (others haven't submitted yet)
          if (Math.random() < 0.7) {
            try {
              const gradeData = {
                studentId: student._id,
                assignmentId: assignment._id,
                courseId: course._id,
                score: Math.floor(Math.random() * assignmentData.totalPoints),
                feedback: faker.lorem.paragraph(),
                gradedBy: course.instructor,
                gradedAt: faker.date.recent({days: 7}),
              };
              
              const gradeResponse = await apiClient.post('/grades', gradeData);
              grades.push(gradeResponse.data.data);
              console.log(`Created grade for ${student.firstName} ${student.lastName} on assignment ${assignment.title}`);
            } catch (error) {
              console.error(`Error creating grade:`, error.response?.data?.message || error.message);
            }
          }
        }
      } catch (error) {
        console.error(`Error creating assignment:`, error.response?.data?.message || error.message);
      }
    }
  }
}

// Generate attendance records
async function generateAttendance() {
  console.log('Generating attendance records...');
  
  // Generate attendance for the past 90 days
  const attendanceDates = [];
  for (let i = 0; i < NUM_ATTENDANCE_RECORDS; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      attendanceDates.push(date);
    }
  }
  
  // For each course and date, create attendance records
  for (const course of courses) {
    for (const date of attendanceDates) {
      // Only generate attendance for course days
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      if (course.schedule.days.includes(dayOfWeek)) {
        const courseStudents = students.filter(s => course.students.includes(s._id));
        
        for (const student of courseStudents) {
          // Random attendance status with weights
          const statusRandom = Math.random();
          let status;
          if (statusRandom < 0.85) {
            status = 'present';
          } else if (statusRandom < 0.92) {
            status = 'absent';
          } else if (statusRandom < 0.97) {
            status = 'late';
          } else {
            status = 'excused';
          }
          
          try {
            const attendanceData = {
              courseId: course._id,
              studentId: student._id,
              date: date.toISOString(),
              status,
              notes: status !== 'present' ? faker.lorem.sentence() : '',
              recordedBy: course.instructor,
            };
            
            const response = await apiClient.post('/attendance', attendanceData);
            attendanceRecords.push(response.data.data);
            
            // Log less frequently to avoid console spam
            if (Math.random() < 0.05) {
              console.log(`Created attendance record for ${student.firstName} ${student.lastName} on ${date.toISOString().split('T')[0]}`);
            }
          } catch (error) {
            console.error(`Error creating attendance record:`, error.response?.data?.message || error.message);
          }
        }
      }
    }
  }
}

// Generate announcements
async function generateAnnouncements() {
  console.log('Generating announcements...');
  
  for (let i = 0; i < NUM_ANNOUNCEMENTS; i++) {
    try {
      const course = i < courses.length ? courses[i] : getRandomItem(courses);
      const announcementData = {
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        courseId: course._id,
        publishedBy: course.instructor,
        publishDate: faker.date.recent({days: 30}),
        priority: Math.random() < 0.2 ? 'high' : 'normal',
        attachments: []
      };
      
      const response = await apiClient.post('/announcements', announcementData);
      announcements.push(response.data.data);
      console.log(`Created announcement: ${announcementData.title}`);
    } catch (error) {
      console.error(`Error creating announcement:`, error.response?.data?.message || error.message);
    }
  }
}

// Generate events
async function generateEvents() {
  console.log('Generating events...');
  
  const eventTypes = ['meeting', 'exam', 'workshop', 'conference', 'cultural', 'sports'];
  
  for (let i = 0; i < NUM_EVENTS; i++) {
    try {
      const startDate = faker.date.soon({days: 30});
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 8) + 1);
      
      const eventData = {
        title: `${faker.word.adjective()} ${getRandomItem(eventTypes)}`,
        description: faker.lorem.paragraph(),
        startDate,
        endDate,
        location: `${faker.word.adjective()} ${faker.word.noun()} ${faker.word.adverb()}`,
        organizer: getRandomItem(teachers)._id,
        type: getRandomItem(eventTypes),
        participants: {
          students: getRandomItems(students, Math.floor(Math.random() * 20) + 5).map(s => s._id),
          teachers: getRandomItems(teachers, Math.floor(Math.random() * 5) + 1).map(t => t._id)
        },
        isPublic: Math.random() < 0.7
      };
      
      const response = await apiClient.post('/events', eventData);
      events.push(response.data.data);
      console.log(`Created event: ${eventData.title}`);
    } catch (error) {
      console.error(`Error creating event:`, error.response?.data?.message || error.message);
    }
  }
}

// Generate academic terms
async function generateAcademicTerms() {
  console.log('Generating academic terms...');
  
  const terms = [
    { name: 'Fall Semester 2023', startDate: '2023-09-01', endDate: '2023-12-20' },
    { name: 'Spring Semester 2024', startDate: '2024-01-15', endDate: '2024-05-30' },
    { name: 'Summer Term 2024', startDate: '2024-06-15', endDate: '2024-08-15' }
  ];
  
  const academicTerms = [];
  
  for (const term of terms) {
    try {
      const termData = {
        name: term.name,
        startDate: new Date(term.startDate),
        endDate: new Date(term.endDate),
        status: new Date() < new Date(term.endDate) ? 'active' : 'completed',
        description: faker.lorem.paragraph()
      };
      
      const response = await apiClient.post('/admin/academic-terms', termData);
      academicTerms.push(response.data.data);
      console.log(`Created academic term: ${termData.name}`);
    } catch (error) {
      console.error('Error creating academic term:', error.response?.data?.message || error.message);
    }
  }
  
  // Associate courses with terms
  for (const course of courses) {
    try {
      const term = getRandomItem(academicTerms);
      await apiClient.patch(`/admin/courses/${course._id}`, { academicTerm: term._id });
      console.log(`Associated course ${course.name} with term ${term.name}`);
    } catch (error) {
      console.error(`Error associating course with term:`, error.response?.data?.message || error.message);
    }
  }
  
  return academicTerms;
}

// Generate payments and fee structures
async function generateFinancialData() {
  console.log('Generating financial data...');
  
  // Create fee structures
  const feeTypes = ['Tuition', 'Activity Fee', 'Technology Fee', 'Library Fee', 'Lab Fee'];
  const feeStructures = [];
  
  for (const type of feeTypes) {
    try {
      const feeData = {
        name: type,
        amount: type === 'Tuition' 
          ? faker.number.int({min: 5000, max: 10000}) 
          : faker.number.int({min: 100, max: 500}),
        dueDate: faker.date.soon({days: 30}),
        description: faker.lorem.sentence(),
        category: type === 'Tuition' ? 'tuition' : 'additional',
        appliesTo: type === 'Lab Fee' ? ['Science', 'Computer Science'] : 'all'
      };
      
      const response = await apiClient.post('/admin/fees', feeData);
      feeStructures.push(response.data.data);
      console.log(`Created fee structure: ${feeData.name} - $${feeData.amount}`);
    } catch (error) {
      console.error(`Error creating fee structure:`, error.response?.data?.message || error.message);
    }
  }
  
  // Generate payments for each student
  for (const student of students) {
    // Generate 1-3 payments per student
    const paymentCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < paymentCount; i++) {
      const feeStructure = getRandomItem(feeStructures);
      
      try {
        const paymentData = {
          studentId: student._id,
          amount: feeStructure.amount,
          feeType: feeStructure.name,
          paymentDate: faker.date.recent({days: 30}),
          paymentMethod: getRandomItem(['credit_card', 'debit_card', 'bank_transfer', 'cash']),
          transactionId: faker.string.alphanumeric(10).toUpperCase(),
          status: getRandomItem(['completed', 'pending', 'failed']),
          notes: faker.lorem.sentence()
        };
        
        const response = await apiClient.post('/payments', paymentData);
        console.log(`Created payment for ${student.firstName} ${student.lastName}: ${feeStructure.name} - $${feeStructure.amount}`);
      } catch (error) {
        console.error(`Error creating payment:`, error.response?.data?.message || error.message);
      }
    }
  }
  
  return feeStructures;
}

// Generate messages between users
async function generateMessages() {
  console.log('Generating messages between users...');
  
  const messageCount = 50; // Number of messages to generate
  const messageTypes = ['inquiry', 'feedback', 'announcement', 'general'];
  const messageCounts = { sent: 0, threads: 0 };
  
  // Create message threads between teachers and parents
  for (let i = 0; i < messageCount; i++) {
    try {
      // Randomly select a parent and teacher
      const parent = getRandomItem(parents);
      const teacher = getRandomItem(teachers);
      
      // Find a student that is a child of this parent
      const childIds = parent.children || [];
      if (childIds.length === 0) continue;
      
      const studentId = getRandomItem(childIds);
      const student = students.find(s => s._id === studentId);
      
      if (!student) continue;
      
      // Create a new message thread
      const threadData = {
        subject: faker.lorem.sentence(5),
        participants: [parent._id, teacher._id],
        createdBy: Math.random() > 0.5 ? parent._id : teacher._id,
        type: getRandomItem(messageTypes),
        relatedTo: { studentId: student._id },
        status: 'active'
      };
      
      const threadResponse = await apiClient.post('/messages/threads', threadData);
      const thread = threadResponse.data.data;
      messageCounts.threads++;
      
      // Add 1-5 messages to this thread
      const numMessages = Math.floor(Math.random() * 5) + 1;
      
      for (let j = 0; j < numMessages; j++) {
        const sender = j % 2 === 0 ? threadData.createdBy : (threadData.createdBy === parent._id ? teacher._id : parent._id);
        
        const messageData = {
          threadId: thread._id,
          sender,
          content: faker.lorem.paragraph(),
          attachments: [],
          readBy: j === numMessages - 1 ? [] : [sender]
        };
        
        await apiClient.post('/messages', messageData);
        messageCounts.sent++;
      }
      
      console.log(`Created message thread: "${threadData.subject}" with ${numMessages} messages`);
    } catch (error) {
      console.error(`Error creating message:`, error.response?.data?.message || error.message);
    }
  }
  
  return messageCounts;
}

// Add function to generate classes based on the migration
async function generateClasses() {
  console.log('Generating classes...');
  
  const classNames = ['Class 1-A', 'Class 2-B', 'Class 3-C', 'Class 4-D', 'Class 5-E', 
                      'Class 6-F', 'Class 7-G', 'Class 8-H', 'Class 9-I', 'Class 10-J',
                      'Class 11-K', 'Class 12-L', 'Class 13-M', 'Class 14-N', 'Class 15-O'];
  
  for (let i = 0; i < NUM_CLASSES; i++) {
    try {
      const teacherId = getRandomItem(teachers)?._id;
      
      const classData = {
        name: classNames[i] || `Class ${i+1}`,
        gradeLevel: faker.number.int({min: 1, max: 12}),
        academicYear: `${2023 + Math.floor(i / 4)}-${2024 + Math.floor(i / 4)}`,
        homeroom: `Room ${faker.string.alpha(1).toUpperCase()}-${faker.number.int({min: 100, max: 300})}`,
        classTutor: teacherId,
        capacity: faker.number.int({min: 20, max: 35}),
        description: faker.lorem.paragraph()
      };
      
      const response = await apiClient.post('/admin/classes', classData);
      classes.push(response.data.data);
      console.log(`Created class: ${classData.name}`);
      
      // Assign some students to this class
      const numStudentsInClass = Math.floor(Math.random() * 10) + 15; // 15-25 students
      const classStudents = getRandomItems(students, numStudentsInClass);
      
      for (const student of classStudents) {
        try {
          await apiClient.patch(`/admin/students/${student._id}`, { classId: response.data.data._id });
          console.log(`Assigned ${student.firstName} ${student.lastName} to class ${classData.name}`);
        } catch (error) {
          console.error(`Error assigning student to class:`, error.response?.data?.message || error.message);
        }
      }
    } catch (error) {
      console.error('Error creating class:', error.response?.data?.message || error.message);
    }
  }
}

// Add function to generate documents based on the migration
async function generateDocuments() {
  console.log('Generating documents...');
  
  const documentTypes = ['Report Card', 'Certificate', 'Permission Form', 'Medical Form', 
                        'Application', 'Transcript', 'Letter', 'Policy Document'];
  
  for (let i = 0; i < NUM_DOCUMENTS; i++) {
    try {
      const documentType = getRandomItem(documentTypes);
      const isPublic = Math.random() > 0.7;
      const belongsToStudent = Math.random() > 0.5 ? getRandomItem(students)?._id : null;
      const uploadedBy = getRandomItem(teachers)?._id;
      
      const documentData = {
        title: `${documentType} - ${faker.lorem.words(3)}`,
        type: documentType.toLowerCase().replace(' ', '_'),
        description: faker.lorem.paragraph(),
        fileUrl: faker.internet.url(),
        mimeType: getRandomItem(['application/pdf', 'application/msword', 'image/jpeg', 'text/plain']),
        fileSize: faker.number.int({min: 10000, max: 5000000}),
        uploadedBy: uploadedBy,
        uploadedAt: faker.date.recent({days: 30}),
        isPublic: isPublic,
        tags: faker.helpers.arrayElements(['important', 'archived', 'draft', 'final', 'template'], faker.number.int({min: 1, max: 3})),
        studentId: belongsToStudent,
        metadata: {
          version: faker.system.semver(),
          pages: faker.number.int({min: 1, max: 30}),
          lastModified: faker.date.recent({days: 15})
        }
      };
      
      const response = await apiClient.post('/admin/documents', documentData);
      documents.push(response.data.data);
      console.log(`Created document: ${documentData.title}`);
    } catch (error) {
      console.error('Error creating document:', error.response?.data?.message || error.message);
    }
  }
}

// Add function to generate class schedules based on the migration
async function generateClassSchedules() {
  console.log('Generating class schedules...');
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['8:00-9:30', '9:45-11:15', '11:30-13:00', '14:00-15:30', '15:45-17:15'];
  
  for (const classObj of classes) {
    try {
      // Generate a weekly schedule for this class
      for (const day of daysOfWeek) {
        // Add 3-5 periods per day
        const periodsPerDay = faker.number.int({min: 3, max: 5});
        const daySlots = faker.helpers.arrayElements(timeSlots, periodsPerDay);
        
        for (let i = 0; i < periodsPerDay; i++) {
          const courseId = getRandomItem(courses)?._id;
          const teacherId = getRandomItem(teachers)?._id;
          
          const scheduleData = {
            classId: classObj._id,
            day: day.toLowerCase(),
            period: i + 1,
            startTime: daySlots[i].split('-')[0],
            endTime: daySlots[i].split('-')[1],
            courseId: courseId,
            teacherId: teacherId,
            room: `Room ${faker.string.alpha(1).toUpperCase()}-${faker.number.int({min: 100, max: 300})}`,
            recurrence: 'weekly',
          };
          
          const response = await apiClient.post('/admin/schedules', scheduleData);
          classSchedules.push(response.data.data);
          
          // Log less frequently to avoid console spam
          if (Math.random() < 0.2) {
            console.log(`Created schedule: Class ${classObj.name}, ${day}, Period ${i+1}, ${daySlots[i]}`);
          }
        }
      }
    } catch (error) {
      console.error('Error creating class schedule:', error.response?.data?.message || error.message);
    }
  }
}

// Add function to generate feedbacks based on the migration
async function generateFeedbacks() {
  console.log('Generating feedbacks...');
  
  const feedbackTypes = ['academic', 'behavior', 'attendance', 'general'];
  
  for (let i = 0; i < NUM_FEEDBACKS; i++) {
    try {
      const student = getRandomItem(students);
      const teacher = getRandomItem(teachers);
      const course = getRandomItem(courses);
      
      const feedbackData = {
        studentId: student._id,
        teacherId: teacher._id,
        courseId: Math.random() > 0.3 ? course._id : null,
        type: getRandomItem(feedbackTypes),
        content: faker.lorem.paragraphs(2),
        rating: faker.number.int({min: 1, max: 5}),
        date: faker.date.recent({days: 45}),
        isPrivate: Math.random() > 0.7,
        tags: faker.helpers.arrayElements(['improvement', 'excellence', 'concern', 'progress'], faker.number.int({min: 1, max: 2})),
      };
      
      const response = await apiClient.post('/feedbacks', feedbackData);
      feedbacks.push(response.data.data);
      console.log(`Created feedback for ${student.firstName} ${student.lastName} from ${teacher.firstName} ${teacher.lastName}`);
    } catch (error) {
      console.error('Error creating feedback:', error.response?.data?.message || error.message);
    }
  }
}

// Add function to generate login attempts based on the migration
async function generateLoginAttempts() {
  console.log('Generating login attempts...');
  
  const allUsers = [...teachers, ...students, ...parents];
  
  for (let i = 0; i < NUM_LOGIN_ATTEMPTS; i++) {
    try {
      const user = getRandomItem(allUsers);
      const successful = Math.random() > 0.3;
      
      const attemptData = {
        userId: user._id,
        email: user.email,
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        timestamp: faker.date.recent({days: 14}),
        success: successful,
        failureReason: !successful ? getRandomItem(['invalid_password', 'account_locked', 'session_expired']) : null,
      };
      
      const response = await apiClient.post('/admin/security/login-attempts', attemptData);
      loginAttempts.push(response.data.data);
      console.log(`Created login attempt for ${user.email} (${successful ? 'successful' : 'failed'})`);
    } catch (error) {
      console.error('Error creating login attempt:', error.response?.data?.message || error.message);
    }
  }
}

// Add function to generate parent-child relationships based on the migration
async function generateParentChildRelationships() {
  console.log('Generating parent-child relationships...');
  
  const relationshipTypes = ['biological', 'adoptive', 'guardian', 'stepparent'];
  
  // First clear existing relationships to avoid duplication
  for (const parent of parents) {
    try {
      // Keep track of existing children to avoid duplicates
      const childrenIds = new Set();
      
      // Generate 1-3 relationships per parent
      const numRelationships = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numRelationships; i++) {
        // Find a student not already assigned to this parent
        let student = getRandomItem(students);
        let attempts = 0;
        
        // Try up to 10 times to find a student not already assigned
        while (childrenIds.has(student._id) && attempts < 10) {
          student = getRandomItem(students);
          attempts++;
        }
        
        if (childrenIds.has(student._id)) {
          continue; // Skip if we couldn't find a unique student
        }
        
        childrenIds.add(student._id);
        
        const relationshipData = {
          parentId: parent._id,
          studentId: student._id,
          relationship: getRandomItem(relationshipTypes),
          isPrimary: i === 0, // First relationship is primary
          hasLegalCustody: Math.random() > 0.2,
          canPickup: Math.random() > 0.1,
          livesWithStudent: Math.random() > 0.3,
          emergencyContact: Math.random() > 0.5,
          receivesCommunications: true,
          notes: Math.random() > 0.7 ? faker.lorem.sentence() : ''
        };
        
        const response = await apiClient.post('/admin/parent-relationships', relationshipData);
        console.log(`Created ${relationshipData.relationship} relationship between ${parent.firstName} ${parent.lastName} and ${student.firstName} ${student.lastName}`);
      }
    } catch (error) {
      console.error('Error creating parent-child relationship:', error.response?.data?.message || error.message);
    }
  }
}

// Update the generateAllData function to include parent-child relationships
async function generateAllData() {
  try {
    console.log('Starting fake data generation based on migration tables...');
    
    // Login first
    const loggedIn = await loginAsAdmin();
    if (!loggedIn) {
      console.error('Failed to login as admin. Make sure the admin account exists and API is running.');
      return;
    }
    
    // Generate data in sequence to maintain references
    await generateDepartments();
    await generateTeachers();
    await generateStudents();
    await generateParents();
    await generateParentChildRelationships();
    const academicTerms = await generateAcademicTerms();
    await generateClasses();
    await generateCourses();
    await generateMaterials();
    await generateDocuments();
    await generateAssignments();
    await generateAttendance();
    await generateClassSchedules();
    await generateAnnouncements();
    await generateEvents();
    await generateFeedbacks();
    const feeStructures = await generateFinancialData();
    const messageCounts = await generateMessages();
    await generateLoginAttempts();
    
    console.log('Data generation complete!');
    
    // Save summary stats with new tables
    console.log('\nSummary:');
    console.log(`- ${departments.length} departments created`);
    console.log(`- ${teachers.length} teachers created`);
    console.log(`- ${students.length} students created`);
    console.log(`- ${parents.length} parents created`);
    console.log(`- ${academicTerms?.length || 0} academic terms created`);
    console.log(`- ${classes.length} classes created`);
    console.log(`- ${courses.length} courses created`);
    console.log(`- ${materials.length} course materials created`);
    console.log(`- ${documents.length} documents created`);
    console.log(`- ${assignments.length} assignments created`);
    console.log(`- ${grades.length} grades created`);
    console.log(`- ${classSchedules.length} class schedules created`);
    console.log(`- ${attendanceRecords.length} attendance records created`);
    console.log(`- ${announcements.length} announcements created`);
    console.log(`- ${events.length} events created`);
    console.log(`- ${feedbacks.length} feedbacks created`);
    console.log(`- ${feeStructures?.length || 0} fee structures created`);
    console.log(`- ${messageCounts?.threads || 0} message threads with ${messageCounts?.sent || 0} messages created`);
    console.log(`- ${loginAttempts.length} login attempt records created`);
    
  } catch (error) {
    console.error('Error in data generation:', error);
  }
}

// Run the script
generateAllData(); 