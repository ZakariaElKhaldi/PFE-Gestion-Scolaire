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
# On Windows, use the batch file
cd backend
db\reset-db.bat

# On Linux/Mac or PowerShell with semicolons
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

## Troubleshooting

### No Assignments Showing on Dashboard
1. Ensure you're logged in as the Student Johnson account (student@school.com)
2. Run the reset-db script to recreate test data
3. Check that the backend server is running properly
4. Verify in the browser console that you're logged in with the correct user ID

### API 404 Errors
1. Check that the backend server is running on the correct port
2. Ensure API routes match the expected endpoints
3. Verify that your database contains the necessary data
4. Check authentication (JWT token) in local storage

### Database Connection Issues
1. Verify your MySQL server is running
2. Check database credentials in the .env file
3. Run the reset-db script to rebuild the database

### Document Upload Problems
1. Check that the uploads directory exists and has write permissions
2. Verify the file size is within limits
3. Ensure you're authenticated before attempting uploads

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

[MIT](LICENSE)
