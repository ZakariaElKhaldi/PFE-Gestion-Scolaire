# Database Seeding Scripts

This directory contains scripts to generate fake data for the school management system. These scripts populate the database with realistic test data to demonstrate the application's functionality.

## Available Scripts

### `seed-database.js`

Main script to set up and run the data generation process. This script:
1. Verifies the backend is running
2. Ensures an admin user exists
3. Installs required dependencies
4. Runs the data generation script

### `generate-fake-data.js`

Core data generation script that creates:
- Users (administrators, teachers, students, parents)
- Departments and courses
- Academic terms and course enrollments
- Course materials and assignments
- Grades and attendance records
- Announcements and events
- Financial data (fee structures and payments)
- Messages between teachers and parents

## How to Use

### Prerequisites
- Backend server must be running
- Node.js and npm installed

### Running the Seeder

1. Navigate to the project root directory
2. Run the seeding script:

```bash
# Make sure backend server is running first
npm run dev:backend

# In a separate terminal, run the seeder
node scripts/seed-database.js
```

Alternatively, use the npm script:

```bash
npm run seed-db
```

## Configuration

The seeder uses these default settings:
- API URL: `http://localhost:3001/api`
- Admin email: `admin@school.com`
- Admin password: `Admin123!`

You can customize by setting environment variables:

```bash
API_URL=http://yourapi.com/api node scripts/seed-database.js
```

## Generated Data

The script generates:
- 5 departments
- 20 teachers
- 100 students
- 50 parents
- 3 academic terms
- 30 courses
- 300 course materials
- 150 assignments with grades
- Attendance records for 90 days
- 20 announcements
- 15 school events
- 5 fee structure types
- Multiple payments for each student
- 50 message threads between parents and teachers

## User Credentials

All generated users have predictable passwords for testing:

- Admin: `Admin123!`
- Teachers: `Teacher123!`
- Students: `Student123!`
- Parents: `Parent123!`

## Customization

You can modify the data generation quantities by editing the configuration variables at the top of `generate-fake-data.js`.

## Note on ES Modules

These scripts use ES Module syntax (import/export) rather than CommonJS (require). This is because the project is configured with `"type": "module"` in package.json. 