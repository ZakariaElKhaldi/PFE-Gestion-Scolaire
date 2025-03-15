# School Management System

A comprehensive full-stack school management system for managing educational institutions. The system handles students, teachers, courses, assignments, documents, attendance, and more through a modern web interface.

![School Management System](https://via.placeholder.com/800x400?text=School+Management+System)

## Features

- **User Management**: Support for different user roles (administrators, teachers, students, parents)
- **Course Management**: Create and manage courses, enrollments, and class schedules
- **Assignment System**: Create, submit, and grade assignments with due dates
- **Document Management**: Upload, store, and share academic documents
- **Attendance Tracking**: Record and monitor student attendance
- **Grading System**: Manage grades across courses and assignments
- **Feedback System**: Allow students to provide course feedback with ratings and comments
- **Responsive Interface**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with **Express.js**: REST API framework
- **MySQL**: Relational database for data storage
- **JWT**: Authentication and authorization
- **Multer**: File upload handling

### Frontend
- **React**: Single page application
- **Vite**: Build tool and development server
- **React Router**: Navigation and routing
- **Context API**: State management
- **Axios**: API requests
- **React Query**: Server state management
- **Tailwind CSS**: Styling and UI components

## Prerequisites

- Node.js (v14+)
- MySQL (v8+)

## Project Structure

```
PFE-Gestion-Scolaire/
├── backend/
│   ├── db/                     # Database scripts and migrations
│   │   ├── schema.sql          # Database schema
│   │   ├── seed-users.js       # Creates default users
│   │   ├── seed-test-data.js   # Creates test data
│   │   └── reset-db.js         # Automated database reset
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Data models
│   │   ├── routes/             # API route definitions
│   │   ├── middleware/         # Express middleware
│   │   └── utils/              # Helper functions
│   ├── .env                    # Environment variables
│   └── package.json            # Backend dependencies
│
├── front-web/                  # Web frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   │   └── dashboard/      # Dashboard views by role
│   │   ├── services/           # API service clients
│   │   ├── context/            # React context providers
│   │   └── utils/              # Frontend utilities
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
│
└── front-mobile/               # Mobile application
    ├── app/                    # Mobile app screens
    ├── components/             # Mobile components
    ├── services/               # Mobile API services
    └── package.json            # Mobile dependencies
```

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies
```bash
# Backend dependencies
cd backend
npm install

# Web frontend dependencies
cd ../front-web
npm install

# Mobile dependencies (optional)
cd ../front-mobile
npm install
```

3. Set up environment variables
```bash
# Backend environment
cd backend
cp .env.example .env
```

Edit the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pfe
JWT_SECRET=your_jwt_secret
```

4. Create and set up the database

### Option 1: Manual Setup
```bash
# Create the database schema
node db/setup.js

# Seed the database with sample data
node db/seed.js
```

### Option 2: Automated Reset and Setup (Recommended)
```bash
# On Windows PowerShell
cd backend
node db/reset-db.js

# On Linux/Mac
cd backend
node db/reset-db.js
```

This will:
- Reset the database schema
- Create test users with specific IDs
- Seed comprehensive test data including courses, assignments, etc.
- Create specific assignments for the Student Johnson account

## Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

**Note for Windows PowerShell Users:**
If you encounter the error `The token '&&' is not a valid statement separator in this version` when using commands with `&&`, use separate commands or use PowerShell's `;` separator instead:

```powershell
# Instead of this (which won't work in PowerShell)
cd backend && npm run dev

# Use this instead
cd backend; npm run dev

# Or run each command separately
cd backend
npm run dev
```

2. Start the frontend (in a new terminal)
```bash
cd front-web
npm run dev
```

3. Access the application at `http://localhost:5173`

## Database Structure

The system uses a relational database with the following main tables:

- `users`: Stores all users (administrators, teachers, students, parents)
- `departments`: Academic departments
- `courses`: Courses offered by the institution
- `course_enrollments`: Student enrollments in courses
- `classes`: Specific class instances with schedules
- `class_schedules`: Weekly schedule for classes
- `assignments`: Assignments for courses
- `assignment_submissions`: Student submissions for assignments
- `grades`: Student grades for assignments and courses
- `attendance`: Student attendance records
- `documents`: Uploaded files and documents
- `messages`: Internal communication between users
- `materials`: Course materials and resources
- `events`: School events and activities
- `notifications`: System notifications for users
- `parent_child`: Relationship between parent and student users
- `feedback`: Student feedback for courses

## API Endpoints

### Authentication
- `POST /api/auth/login`: Login with email and password
- `GET /api/auth/me`: Get current authenticated user info

### Student Endpoints
- `GET /api/students/dashboard`: Get student dashboard data
- `GET /api/students/courses`: Get courses for the current student
- `GET /api/assignments/upcoming`: Get upcoming assignments
- `GET /api/assignments/submissions/my`: Get submitted assignments
- `GET /api/students/grades/recent`: Get recent grades
- `GET /api/students/attendance`: Get attendance statistics
- `GET /api/students/schedule`: Get student schedule

### Course Endpoints
- `GET /api/courses`: Get all courses
- `GET /api/courses/:id`: Get course details

### Document Endpoints
- `GET /api/documents`: Get documents for the current user
- `POST /api/documents`: Upload a new document
- `GET /api/documents/:id`: Get document details
- `PUT /api/documents/:id`: Update document metadata
- `DELETE /api/documents/:id`: Delete a document

### Feedback Endpoints
- `GET /api/feedback/student`: Get feedback submitted by the current student
- `POST /api/feedback/submit`: Submit new course feedback
- `GET /api/feedback/course/:courseId`: Get feedback for a specific course
- `GET /api/feedback/teacher`: Get feedback for courses taught by the current teacher

## Default Users

After running the seed script, you can use the following users to login:

- **Admin User**
  - Email: admin@school.com
  - Password: password123

- **Teacher User**
  - Email: teacher@school.com
  - Password: password123

- **Student User**
  - Email: student@school.com
  - Password: password123
  - ID: f4b969e2-324a-4333-9624-d016a54ea06d

- **Parent User**
  - Email: parent@school.com
  - Password: password123

## Recent Updates and Fixes

- **Fixed Database Connection Issues**: Enhanced connection pooling in document and assignment models
- **Improved Error Handling**: Better error management for database operations
- **Assignment Linking**: Fixed issues with assignments not being correctly linked to users
- **Added Test Data**: Created comprehensive test data scripts for development
- **Document Management**: Fixed issues with document uploads and retrieval
- **API Endpoints**: Corrected routing for assignment submissions
- **Database Seeding**: Improved seeding process with reset script
- **Feedback System**: Added auto-enrollment feature for course feedback submission and fixed 404/500 errors
- **API Authentication**: Fixed authentication issues in the feedback component
- **Table Creation**: Automated feedback table creation to avoid missing table errors
- **Feedback Routes**: Fixed missing API routes registration in Express app
- **Teacher Dashboard API**: Improved response handling for schedule and dashboard data
- **API Response Format**: Enhanced frontend services to handle various API response formats
- **Null/Undefined Handling**: Added robust checks for missing or undefined values in API responses

## Troubleshooting

### No Assignments Showing on Dashboard
1. Ensure you're logged in as the Student Johnson account (student@school.com)
2. Run the reset-db script to recreate test data
3. Check that the backend server is running properly
4. Verify in the browser console that you're logged in with the correct user ID

### API 401 Unauthorized Errors
1. Check that you're properly logged in (JWT token in localStorage)
2. Verify that the frontend API client is configured to include the Authorization header
3. Make sure you're using the correct API client for requests rather than direct fetch calls
4. Check that the Vite proxy is properly configured in vite.config.ts
5. Restart both frontend and backend servers

### Database Connection Issues
1. Verify your MySQL server is running
2. Check database credentials in the .env file
3. Run the reset-db script to rebuild the database

### Document Upload Problems
1. Check that the uploads directory exists and has write permissions
2. Verify the file size is within limits
3. Ensure you're authenticated before attempting uploads

### "Invalid schedule data format from API" Error
1. Check the browser console for the exact API response structure
2. Verify the backend controller is returning data in the expected format
3. Ensure the frontend service correctly handles the API response structure
4. Try refreshing the page or restarting the backend server
5. Check that the TeacherController.getScheduleByDay method is returning properly formatted data

### Feedback Submission Issues
1. Make sure all feedback fields (course, rating, comment) are filled out
2. Check that the API client is properly configured to use the correct base URL
3. Verify that you have the necessary permissions (student role) to submit feedback
4. **Auto-enrollment now activated**: Students will now be automatically enrolled in courses when submitting feedback
5. If you see a "You have already submitted feedback for this course" error, you can only submit one feedback per course

## Windows PowerShell Users
If you're using Windows PowerShell, note that it uses different command separators than bash:
1. The `&&` operator is not supported for command chaining
2. Use the semicolon (`;`) instead: `cd backend; npm run dev`
3. Or run each command separately

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

[MIT](LICENSE)

## Testing the Feedback System

To test the feedback system, follow these steps:

1. Log in as a student (e.g., Student Johnson with email student@school.com)
2. Navigate to the Feedback page in the student dashboard
3. You should see a dropdown with available courses
4. Select the course "Test Course [timestamp]" that was created for testing
5. Provide a rating (1-5 stars) and a comment
6. Submit the feedback

If you encounter any issues:

- Make sure you're logged in as a student
- Check that you're enrolled in at least one course
- Verify that you haven't already submitted feedback for all your courses

To create a new test course for feedback testing, run:
```bash
cd backend
npx ts-node src/utils/create-test-course.ts
```

To check which courses you're enrolled in and which ones you've already submitted feedback for:
```bash
cd backend
npx ts-node src/utils/list-courses.ts
```

### Troubleshooting

- If you see "No courses available" in the dropdown, it means you're not enrolled in any courses or there was an error fetching your courses.
- If you get a "You have already submitted feedback for this course" error, you can only submit one feedback per course.
- The auto-enrollment feature is now active - students will be automatically enrolled in courses when submitting feedback.
