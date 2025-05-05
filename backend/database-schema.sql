-- School Management System - Complete MySQL Database Schema
-- Generated: 2023-10-27 (or current date)
-- Version: 2.0 (Fixed and Improved)

CREATE DATABASE IF NOT EXISTS testpfe;
USE testpfe;

-- Set default character set for the database
ALTER DATABASE testpfe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- === Core Tables ===

-- USERS (base table for all individuals)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36), -- For multi-institution support
    email VARCHAR(255) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    photoUrl VARCHAR(255), -- Consider replacing with fileId FK to file_storage
    phone VARCHAR(30),
    address VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (firstName, lastName),
    INDEX idx_schoolId (schoolId),
    INDEX idx_isActive (isActive)
    -- Constraint added later after schools table creation
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROLES (Defines user roles within the system)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER ROLES (many-to-many relationship between users and roles)
CREATE TABLE IF NOT EXISTS user_roles (
    userId VARCHAR(36) NOT NULL,
    roleId VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, roleId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === User Profile Tables (Inheritance from users) ===

-- STUDENTS
CREATE TABLE IF NOT EXISTS students (
    userId VARCHAR(36) PRIMARY KEY, -- FK to users.id
    studentId VARCHAR(50) UNIQUE,   -- School-assigned student ID
    enrollmentYear INT NOT NULL,
    level VARCHAR(50) NOT NULL,
    birthDate DATE NOT NULL,
    currentGrade VARCHAR(20),
    program VARCHAR(100),
    graduationYear INT,
    status ENUM('active', 'graduated', 'suspended', 'withdrawn') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (studentId),
    INDEX idx_status (status),
    INDEX idx_enrollmentYear (enrollmentYear),
    INDEX idx_level (level)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEACHERS
CREATE TABLE IF NOT EXISTS teachers (
    userId VARCHAR(36) PRIMARY KEY, -- FK to users.id
    teacherId VARCHAR(50) UNIQUE,   -- School-assigned teacher ID
    employeeId VARCHAR(50) UNIQUE,
    diploma VARCHAR(100) NOT NULL,
    hireDate DATE NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    departmentId VARCHAR(36), -- Changed from department VARCHAR(100)
    status ENUM('active', 'on_leave', 'terminated') DEFAULT 'active',
    maxWeeklyHours INT DEFAULT 40,
    qualifications TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    -- FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL, -- Add later
    INDEX idx_teacher_id (teacherId),
    INDEX idx_employeeId (employeeId),
    INDEX idx_status (status),
    INDEX idx_specialty (specialty)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PARENTS
CREATE TABLE IF NOT EXISTS parents (
    userId VARCHAR(36) PRIMARY KEY, -- FK to users.id
    profession VARCHAR(100),
    employer VARCHAR(100),
    emergencyContact VARCHAR(100), -- Consider linking to another user?
    emergencyPhone VARCHAR(30),
    relationshipToStudent VARCHAR(50), -- Consider ENUM ('mother', 'father', 'guardian', 'other')
    preferredContactMethod ENUM('email', 'phone', 'sms') DEFAULT 'email',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ADMINS (Optional, for admin-specific fields)
CREATE TABLE IF NOT EXISTS admins (
    userId VARCHAR(36) PRIMARY KEY, -- FK to users.id
    position VARCHAR(100),
    -- Add more admin-specific fields here
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PARENT-STUDENT RELATIONSHIP
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id VARCHAR(36) PRIMARY KEY,
    parentUserId VARCHAR(36) NOT NULL, -- FK to parents.userId
    studentUserId VARCHAR(36) NOT NULL, -- FK to students.userId
    relationshipType VARCHAR(50) NOT NULL, -- Consider ENUM
    isPrimaryContact BOOLEAN DEFAULT FALSE,
    hasFinancialResponsibility BOOLEAN DEFAULT FALSE,
    canViewGrades BOOLEAN DEFAULT TRUE,
    canViewAttendance BOOLEAN DEFAULT TRUE,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verificationDocumentFileId VARCHAR(36), -- Renamed from verificationDocument, FK to file_storage
    verifiedAt TIMESTAMP NULL,
    verifiedBy VARCHAR(36), -- FK to users.id (any user with permission)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentUserId) REFERENCES parents(userId) ON DELETE CASCADE,
    FOREIGN KEY (studentUserId) REFERENCES students(userId) ON DELETE CASCADE,
    FOREIGN KEY (verifiedBy) REFERENCES users(id) ON DELETE SET NULL,
    -- FOREIGN KEY (verificationDocumentFileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    UNIQUE KEY unique_parent_student (parentUserId, studentUserId),
    INDEX idx_status (status),
    INDEX idx_isPrimaryContact (isPrimaryContact)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Academic Structure ===

-- DEPARTMENTS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    description TEXT,
    headId VARCHAR(36), -- FK to teachers.userId
    budget DECIMAL(15,2), -- Increased precision
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (headId) REFERENCES teachers(userId) ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_department_code (code),
    INDEX idx_status (status),
    INDEX idx_school_dept_name (schoolId, name)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK constraint now that departments table exists
ALTER TABLE teachers
ADD CONSTRAINT fk_teacher_department FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL;

-- COURSES (Abstract course definition)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY,
    departmentId VARCHAR(36) NOT NULL, -- FK to departments.id
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- Unique within a school/department? Add constraint if needed.
    description TEXT,
    credits DECIMAL(4,2) NOT NULL, -- Allow fractional credits
    level VARCHAR(50),
    -- prerequisiteCourseIds removed, use course_prerequisites table
    mainTeacherId VARCHAR(36), -- Suggests a primary teacher, might be better handled at class level
    maxStudents INT DEFAULT 30, -- Default capacity, can be overridden by class
    syllabus TEXT,
    objectives TEXT,
    gradeSchema JSON, -- Stores grading breakdown (e.g., {'assignments': 40, 'midterm': 30, 'final': 30})
    status ENUM('draft', 'active', 'archived') DEFAULT 'draft', -- Simplified status
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE, -- If dept deleted, course deleted
    FOREIGN KEY (mainTeacherId) REFERENCES teachers(userId) ON DELETE SET NULL,
    UNIQUE KEY unique_course_code_dept (departmentId, code),
    INDEX idx_course_code (code),
    INDEX idx_status (status),
    INDEX idx_level (level),
    FULLTEXT INDEX idx_course_search (title, description, objectives)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COURSE PREREQUISITES (Junction table for many-to-many)
CREATE TABLE IF NOT EXISTS course_prerequisites (
    courseId VARCHAR(36) NOT NULL, -- FK to courses.id
    prerequisiteCourseId VARCHAR(36) NOT NULL, -- FK to courses.id
    PRIMARY KEY (courseId, prerequisiteCourseId),
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisiteCourseId) REFERENCES courses(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CLASSES (Specific instances of a course for a term/year)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,
    courseId VARCHAR(36) NOT NULL, -- FK to courses.id
    teacherId VARCHAR(36) NOT NULL, -- FK to teachers.userId (the primary teacher for this class)
    academicYear VARCHAR(9) NOT NULL, -- e.g., "2024-2025"
    term VARCHAR(20) NOT NULL, -- e.g., "Fall 2024", "Semester 1"
    section VARCHAR(10), -- e.g., "A", "001"
    room VARCHAR(50),
    building VARCHAR(50),
    floor INT,
    capacity INT DEFAULT 30,
    enrolledCount INT DEFAULT 0, -- Can be calculated or maintained via triggers/app logic
    startDate DATE,
    endDate DATE,
    status ENUM('scheduled', 'active', 'cancelled', 'completed') DEFAULT 'scheduled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE, -- If course definition deleted, instances deleted
    FOREIGN KEY (teacherId) REFERENCES teachers(userId) ON DELETE RESTRICT, -- Prevent deleting teacher assigned to class
    UNIQUE KEY unique_class_instance (courseId, academicYear, term, section),
    INDEX idx_academic_year_term (academicYear, term),
    INDEX idx_status (status),
    INDEX idx_teacherId (teacherId),
    INDEX idx_startDate_endDate (startDate, endDate)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CLASS SCHEDULES (Defines meeting times for a class)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS class_schedules (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL, -- FK to classes.id
    day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    room VARCHAR(50), -- Can override class default room for specific sessions
    building VARCHAR(50), -- Can override class default building
    isRecurring BOOLEAN DEFAULT TRUE,
    recurrenceRule VARCHAR(255), -- e.g., iCal RRULE string for complex recurrence
    excludeDates TEXT, -- Comma-separated list of YYYY-MM-DD dates to exclude
    notificationSent BOOLEAN DEFAULT FALSE, -- For mobile notifications
    notifyMinutesBefore INT DEFAULT 15, -- For mobile notifications
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    INDEX idx_class_schedule (classId, day, startTime)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CLASS ENROLLMENTS (Replaces course_enrollments)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS class_enrollments (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL, -- FK to users.id (student user)
    classId VARCHAR(36) NOT NULL,   -- FK to classes.id
    enrollmentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'completed', 'dropped', 'waitlisted', 'pending') DEFAULT 'active',
    grade VARCHAR(10), -- Final grade for this class enrollment (e.g., 'A', 'B-', 'Pass')
    creditsEarned DECIMAL(4,2), -- Credits earned upon completion
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE, -- If user deleted, enrollment deleted
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE, -- If class deleted, enrollment deleted
    UNIQUE KEY unique_enrollment (studentId, classId),
    INDEX idx_status (status),
    INDEX idx_classId (classId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Academic Activities & Records ===

-- ATTENDANCE
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id (Removed redundant courseId)
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id (student user)
    date DATE NOT NULL,
    sessionStartTime TIME NULL,       -- Optional: For classes meeting multiple times a day
    sessionEndTime TIME NULL,         -- Optional
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL,
    notes TEXT,
    justificationText TEXT,
    justificationDocumentFileId VARCHAR(36), -- FK to file_storage.id
    justificationStatus ENUM('pending', 'approved', 'rejected') DEFAULT NULL,
    reviewedBy VARCHAR(36),           -- FK to users.id (teacher/admin)
    reviewedAt TIMESTAMP NULL,
    recordedBy VARCHAR(36) NOT NULL,  -- FK to users.id (who took attendance)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE RESTRICT, -- Don't delete user who recorded
    -- FOREIGN KEY (justificationDocumentFileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    UNIQUE KEY unique_attendance (classId, studentId, date, sessionStartTime), -- Adjusted unique key
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_student_date (studentId, date)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ASSIGNMENTS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL,    -- FK to classes.id (Changed from courseId)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('homework', 'quiz', 'essay', 'project', 'lab', 'other') DEFAULT 'homework',
    dueDate DATETIME NOT NULL,
    points DECIMAL(6,2) DEFAULT 100.00, -- Allow fractional points
    status ENUM('draft', 'published', 'closed', 'graded') DEFAULT 'draft',
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id (teacher/admin)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT, -- Don't delete creator if assignments exist
    INDEX idx_classId (classId),
    INDEX idx_dueDate (dueDate),
    INDEX idx_status (status),
    FULLTEXT INDEX idx_assignment_search (title, description)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUBMISSIONS (Student submissions for assignments)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignmentId VARCHAR(36) NOT NULL, -- FK to assignments.id
    studentId VARCHAR(36) NOT NULL,    -- FK to users.id (student user)
    submissionText TEXT,
    submissionFileId VARCHAR(36),      -- FK to file_storage.id (Replaced fileUrl)
    submissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(6,2) NULL,           -- Grade for this specific submission
    feedback TEXT,
    gradedBy VARCHAR(36),              -- FK to users.id (teacher/grader)
    gradedAt TIMESTAMP NULL,
    isLate BOOLEAN GENERATED ALWAYS AS (submissionDate > (SELECT dueDate FROM assignments WHERE id = assignmentId)) STORED, -- Calculated field
    status ENUM('draft', 'submitted', 'graded', 'returned') DEFAULT 'submitted',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE SET NULL,
    -- FOREIGN KEY (submissionFileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    UNIQUE KEY unique_submission (assignmentId, studentId),
    INDEX idx_status (status),
    INDEX idx_studentId (studentId),
    INDEX idx_submissionDate (submissionDate)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GRADES (Consolidated grades - might include assignments, exams, overall)
-- Consider if this table is needed if grades are on submissions, exam_attempts etc.
-- Could be used for manual grade entries or final calculated grades.
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS grades (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id (More specific than courseId)
    enrollmentId VARCHAR(36) NULL,    -- Optional FK to class_enrollments for context
    relatedEntity ENUM('assignment', 'exam', 'quiz', 'participation', 'manual', 'final') NOT NULL,
    relatedEntityId VARCHAR(36) NULL, -- FK to assignments.id, exam_attempts.id, quiz_attempts.id etc.
    gradeValue DECIMAL(6,2) NOT NULL, -- Numeric grade
    gradeLetter VARCHAR(10) NULL,     -- Optional letter grade (A, B+, etc.)
    comments TEXT,
    gradedBy VARCHAR(36) NOT NULL,    -- FK to users.id
    gradedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isFinalGrade BOOLEAN DEFAULT FALSE, -- Indicates if this is the final grade for the class/term
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollmentId) REFERENCES class_enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE RESTRICT, -- Don't delete grader
    -- Note: relatedEntityId cannot have a single FK due to multiple possible target tables. Handle in application logic.
    UNIQUE KEY unique_grade_entry (studentId, classId, relatedEntity, relatedEntityId),
    INDEX idx_student_class (studentId, classId),
    INDEX idx_related_entity (relatedEntity, relatedEntityId),
    INDEX idx_isFinalGrade (isFinalGrade)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MATERIALS (Course/Class materials)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL,      -- FK to classes.id (Changed from courseId)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('document', 'video', 'link', 'presentation', 'audio', 'interactive', 'assignment_link', 'quiz_link', 'other') NOT NULL,
    contentUrl VARCHAR(500),           -- For external links
    fileId VARCHAR(36),                -- FK to file_storage.id (For uploaded files)
    uploadedBy VARCHAR(36) NOT NULL,   -- FK to users.id
    uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags VARCHAR(255),                 -- Comma-separated tags
    category VARCHAR(100),
    visibleFrom DATETIME NULL,
    visibleUntil DATETIME NULL,
    downloadable BOOLEAN DEFAULT TRUE,
    viewOrder INT DEFAULT 0,           -- For ordering materials within a class
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    INDEX idx_classId (classId),
    INDEX idx_type (type),
    INDEX idx_visible (visibleFrom, visibleUntil),
    FULLTEXT INDEX idx_material_search (title, description, tags, category)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === File Storage ===

-- FILE STORAGE (Centralized table for all uploaded files)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS file_storage (
    id VARCHAR(36) PRIMARY KEY,
    fileName VARCHAR(255) NOT NULL,       -- Stored filename (e.g., UUID.pdf)
    originalName VARCHAR(255) NOT NULL,   -- Original uploaded filename
    path VARCHAR(500) NOT NULL,           -- Relative path in storage
    mimeType VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,                 -- Size in bytes
    storageProvider VARCHAR(50) DEFAULT 'local', -- e.g., 'local', 's3', 'gcs'
    userId VARCHAR(36) NOT NULL,          -- FK to users.id (Uploader)
    entityType VARCHAR(50),               -- e.g., 'submission', 'material', 'profile_photo', 'justification'
    entityId VARCHAR(36),                 -- FK to the related entity's ID
    isPublic BOOLEAN DEFAULT FALSE,
    -- accessRoles removed, use file_storage_roles
    uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresAt TIMESTAMP NULL,
    thumbnailUrl VARCHAR(500) NULL,       -- Optional URL for image/video thumbnails
    checksum VARCHAR(64) NULL,            -- e.g., SHA-256 hash for integrity
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT, -- Don't delete user if they uploaded files? Or SET NULL?
    INDEX idx_entity (entityType, entityId),
    INDEX idx_userId (userId),
    INDEX idx_uploadedAt (uploadedAt),
    INDEX idx_mimeType (mimeType)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK constraints now that file_storage table exists
ALTER TABLE parent_student_relationships
ADD CONSTRAINT fk_psr_verification_file FOREIGN KEY (verificationDocumentFileId) REFERENCES file_storage(id) ON DELETE SET NULL;

ALTER TABLE attendance
ADD CONSTRAINT fk_att_justification_file FOREIGN KEY (justificationDocumentFileId) REFERENCES file_storage(id) ON DELETE SET NULL;

ALTER TABLE submissions
ADD CONSTRAINT fk_sub_submission_file FOREIGN KEY (submissionFileId) REFERENCES file_storage(id) ON DELETE SET NULL;

ALTER TABLE materials
ADD CONSTRAINT fk_mat_file FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE SET NULL;

-- FILE STORAGE ROLES (Junction table for role-based file access)
CREATE TABLE IF NOT EXISTS file_storage_roles (
    fileId VARCHAR(36) NOT NULL, -- FK to file_storage.id
    roleId VARCHAR(36) NOT NULL, -- FK to roles.id
    permission ENUM('read', 'write') DEFAULT 'read',
    PRIMARY KEY (fileId, roleId),
    FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Communication & Notifications ===

-- MESSAGES (Direct user-to-user messages)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    threadId VARCHAR(36) NOT NULL, -- Groups messages into conversations
    fromUserId VARCHAR(36) NOT NULL, -- FK to users.id
    toUserId VARCHAR(36) NOT NULL,   -- FK to users.id
    subject VARCHAR(255),
    body TEXT NOT NULL,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    readAt TIMESTAMP NULL,
    isDeletedBySender BOOLEAN DEFAULT FALSE,
    isDeletedByReceiver BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE, -- Or SET NULL? Cascade might be better.
    FOREIGN KEY (toUserId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_threadId (threadId),
    INDEX idx_toUserId_readAt (toUserId, readAt),
    INDEX idx_sentAt (sentAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATIONS (System-generated notifications for users)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL, -- FK to users.id (Recipient)
    type VARCHAR(50) NOT NULL,   -- e.g., 'new_grade', 'assignment_due', 'announcement'
    title VARCHAR(255),
    body TEXT NOT NULL,
    data JSON,                   -- Additional context data
    read TINYINT(1) DEFAULT 0,
    readAt TIMESTAMP NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    channel ENUM('app', 'email', 'sms', 'push') DEFAULT 'app', -- Preferred channel, may send to multiple
    isActionable BOOLEAN DEFAULT FALSE,
    actionUrl VARCHAR(255),      -- URL for the action button
    icon VARCHAR(50),            -- Icon identifier (e.g., 'bell', 'grade')
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId_read (userId, read),
    INDEX idx_createdAt (createdAt),
    INDEX idx_type (type)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ANNOUNCEMENTS (School-wide or group-specific announcements)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    targetAudience ENUM('all', 'students', 'teachers', 'parents', 'admins', 'custom_roles', 'custom_groups') DEFAULT 'all',
    targetRoleIds TEXT,         -- Comma-separated role IDs if targetAudience='custom_roles'
    targetGroupIds TEXT,        -- Comma-separated communication_group IDs if targetAudience='custom_groups'
    startDate DATETIME NOT NULL,
    endDate DATETIME,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    attachmentFileId VARCHAR(36), -- FK to file_storage.id
    viewCount INT DEFAULT 0,
    isPinned BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (attachmentFileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_school_status_date (schoolId, status, startDate, endDate),
    INDEX idx_isPinned (isPinned),
    INDEX idx_targetAudience (targetAudience),
    FULLTEXT INDEX idx_announcement_search (title, content)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COMMUNICATION GROUPS (For group messaging, e.g., class groups, club groups)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS communication_groups (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('class', 'course', 'department', 'club', 'project', 'custom') NOT NULL,
    relatedEntityId VARCHAR(36), -- Optional FK to class, course, department etc.
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    isDefault BOOLEAN DEFAULT FALSE, -- e.g., automatically created class groups
    isArchived BOOLEAN DEFAULT FALSE,
    groupSettings JSON, -- e.g., { "allow_member_invites": false, "message_retention_days": 90 }
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_school_type (schoolId, type),
    INDEX idx_relatedEntityId (relatedEntityId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- COMMUNICATION GROUP MEMBERS
CREATE TABLE IF NOT EXISTS communication_group_members (
    groupId VARCHAR(36) NOT NULL, -- FK to communication_groups.id
    userId VARCHAR(36) NOT NULL,  -- FK to users.id
    role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notificationsEnabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (groupId, userId),
    FOREIGN KEY (groupId) REFERENCES communication_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_groups (userId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- GROUP MESSAGES
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS group_messages (
    id VARCHAR(36) PRIMARY KEY,
    groupId VARCHAR(36) NOT NULL,   -- FK to communication_groups.id
    senderId VARCHAR(36) NOT NULL,  -- FK to users.id
    content TEXT NOT NULL,
    attachmentFileIds JSON,         -- JSON array of file IDs from file_storage
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    editedAt TIMESTAMP NULL,
    isAnnouncement BOOLEAN DEFAULT FALSE, -- Message highlighted as announcement within group
    isPinned BOOLEAN DEFAULT FALSE,
    parentMessageId VARCHAR(36) NULL, -- For threaded replies FK to group_messages.id
    FOREIGN KEY (groupId) REFERENCES communication_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE, -- Or SET NULL/RESTRICT?
    FOREIGN KEY (parentMessageId) REFERENCES group_messages(id) ON DELETE SET NULL, -- If parent deleted, reply orphaned
    INDEX idx_group_sent (groupId, sentAt),
    INDEX idx_sender (senderId),
    FULLTEXT INDEX idx_message_content (content)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MESSAGE READ RECEIPTS (Tracks who read which group message)
CREATE TABLE IF NOT EXISTS message_read_receipts (
    messageId VARCHAR(36) NOT NULL, -- FK to group_messages.id
    userId VARCHAR(36) NOT NULL,    -- FK to users.id
    readAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (messageId, userId),
    FOREIGN KEY (messageId) REFERENCES group_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (userId, readAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Financial Tables ===

-- FINANCIAL TRANSACTIONS (Detailed log of all monetary movements)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,      -- FK to users.id (Payer/Recipient)
    schoolId VARCHAR(36) NOT NULL,    -- FK to schools.id
    amount DECIMAL(12,2) NOT NULL,    -- Amount (positive for income, negative for expense/refund)
    currency VARCHAR(3) DEFAULT 'USD',
    type ENUM('payment', 'refund', 'fee', 'scholarship', 'donation', 'expense', 'other') NOT NULL,
    category VARCHAR(100),            -- e.g., 'tuition', 'books', 'activity_fee', 'salary'
    description TEXT,
    paymentMethod VARCHAR(50),        -- e.g., 'stripe', 'paypal', 'cash', 'check', 'bank_transfer'
    externalTransactionId VARCHAR(100),-- ID from payment gateway
    relatedEntityType VARCHAR(50),    -- e.g., 'invoice', 'payment_plan', 'enrollment'
    relatedEntityId VARCHAR(36),
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    processingFee DECIMAL(10,2) DEFAULT 0.00,
    processedAt DATETIME NULL,        -- When the transaction was completed/failed
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT, -- Don't delete user if they have transactions
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT, -- Add later
    INDEX idx_user_status (userId, status),
    INDEX idx_school_type_date (schoolId, type, createdAt),
    INDEX idx_related_entity (relatedEntityType, relatedEntityId),
    INDEX idx_external_id (externalTransactionId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PAYMENT PLANS (For installment-based payments)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS payment_plans (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,      -- FK to users.id (Debtor)
    schoolId VARCHAR(36) NOT NULL,    -- FK to schools.id
    description VARCHAR(255) NOT NULL,
    totalAmount DECIMAL(12,2) NOT NULL,
    numberOfInstallments INT NOT NULL,
    frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'annually') DEFAULT 'monthly',
    startDate DATE NOT NULL,
    endDate DATE,                     -- Calculated or fixed
    status ENUM('active', 'completed', 'defaulted', 'cancelled') DEFAULT 'active',
    autoCharge BOOLEAN DEFAULT FALSE, -- Attempt automatic charges?
    paymentMethodToken VARCHAR(255),  -- Token for stored payment method if autoCharge=TRUE
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_user_status (userId, status),
    INDEX idx_school_status (schoolId, status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INSTALLMENTS (Individual installments within a payment plan)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS installments (
    id VARCHAR(36) PRIMARY KEY,
    paymentPlanId VARCHAR(36) NOT NULL, -- FK to payment_plans.id
    installmentNumber INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    dueDate DATE NOT NULL,
    status ENUM('pending', 'paid', 'partially_paid', 'overdue', 'cancelled') DEFAULT 'pending',
    paidAmount DECIMAL(12,2) DEFAULT 0.00,
    paidAt DATETIME NULL,
    lastTransactionId VARCHAR(36),    -- FK to financial_transactions.id of the last payment
    reminderSent BOOLEAN DEFAULT FALSE,
    reminderSentAt DATETIME NULL,
    lateFeeApplied DECIMAL(10, 2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paymentPlanId) REFERENCES payment_plans(id) ON DELETE CASCADE, -- If plan deleted, installments deleted
    FOREIGN KEY (lastTransactionId) REFERENCES financial_transactions(id) ON DELETE SET NULL,
    UNIQUE KEY unique_plan_installment (paymentPlanId, installmentNumber),
    INDEX idx_dueDate_status (dueDate, status),
    INDEX idx_status (status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INVOICES (Generated invoices for payments)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,       -- FK to users.id (Recipient)
    schoolId VARCHAR(36) NOT NULL,     -- FK to schools.id
    invoiceNumber VARCHAR(50) NOT NULL, -- School-specific invoice number
    issueDate DATE NOT NULL,
    dueDate DATE NOT NULL,
    totalAmount DECIMAL(12,2) NOT NULL,
    paidAmount DECIMAL(12,2) DEFAULT 0.00,
    status ENUM('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    fileId VARCHAR(36),                -- FK to file_storage.id (PDF version)
    relatedEntityType VARCHAR(50),     -- e.g., 'enrollment', 'payment_plan'
    relatedEntityId VARCHAR(36),
    lastPaymentDate DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE SET NULL,
    UNIQUE KEY unique_school_invoice_number (schoolId, invoiceNumber),
    INDEX idx_user_status (userId, status),
    INDEX idx_status_dueDate (status, dueDate),
    INDEX idx_related_entity (relatedEntityType, relatedEntityId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- INVOICE ITEMS (Line items within an invoice)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(36) PRIMARY KEY,
    invoiceId VARCHAR(36) NOT NULL, -- FK to invoices.id
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1.00,
    unitPrice DECIMAL(12,2) NOT NULL,
    totalAmount DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unitPrice) STORED,
    taxRate DECIMAL(5,2) DEFAULT 0.00, -- Percentage
    relatedEntityType VARCHAR(50),   -- e.g., 'course', 'fee_type'
    relatedEntityId VARCHAR(36),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoiceId) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoiceId (invoiceId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Assessments (Exams & Quizzes) ===

-- EXAMS (Formal online or offline exams)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id (Exams are usually for a specific class)
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('online', 'offline', 'midterm', 'final') DEFAULT 'online',
    startTime DATETIME NOT NULL,      -- Scheduled start time
    endTime DATETIME NOT NULL,        -- Scheduled end time
    duration INT NULL,                -- Duration in minutes (for online timed exams)
    passingScore DECIMAL(5,2) DEFAULT 60.00,
    maxAttempts INT DEFAULT 1,        -- Max attempts for online exams
    isRandomized BOOLEAN DEFAULT FALSE, -- Randomize question order?
    showResults ENUM('immediately', 'after_deadline', 'manual', 'never') DEFAULT 'manual',
    accessCode VARCHAR(20) NULL,      -- Optional access code for online exams
    instructions TEXT,
    createdBy VARCHAR(36) NOT NULL,   -- FK to users.id
    status ENUM('draft', 'published', 'active', 'completed', 'archived') DEFAULT 'draft',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_class_status (classId, status),
    INDEX idx_timeframe (startTime, endTime)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EXAM QUESTIONS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS exam_questions (
    id VARCHAR(36) PRIMARY KEY,
    examId VARCHAR(36) NOT NULL, -- FK to exams.id
    questionType ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank') NOT NULL,
    questionText TEXT NOT NULL,
    options JSON,                -- {'a': 'Option A', 'b': 'Option B', 'correct': ['a']} or {'pairs': [{'q':'Q1', 'a':'A1'}], 'decoys': ['D1']}
    points DECIMAL(5,2) DEFAULT 1.00,
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    orderIndex INT NOT NULL,     -- Order within the exam (if not randomized)
    tags VARCHAR(255),           -- Comma-separated tags for categorization
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
    INDEX idx_examId (examId),
    INDEX idx_questionType (questionType)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EXAM ATTEMPTS (Records of student attempts at online exams)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS exam_attempts (
    id VARCHAR(36) PRIMARY KEY,
    examId VARCHAR(36) NOT NULL,      -- FK to exams.id
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id
    attemptNumber INT DEFAULT 1,
    startTime DATETIME NOT NULL,
    endTime DATETIME NULL,            -- When the student finished or timed out
    score DECIMAL(6,2) NULL,          -- Final calculated score
    status ENUM('in_progress', 'completed', 'timed_out', 'submitted', 'graded') DEFAULT 'in_progress',
    submittedAt DATETIME NULL,
    gradedAt DATETIME NULL,
    gradedBy VARCHAR(36) NULL,        -- FK to users.id
    feedback TEXT,                    -- Overall feedback for the attempt
    ipAddress VARCHAR(50),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (gradedBy) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attempt (examId, studentId, attemptNumber),
    INDEX idx_student_exam (studentId, examId),
    INDEX idx_status (status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- EXAM ANSWERS (Student's answers to specific questions in an attempt)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS exam_answers (
    id VARCHAR(36) PRIMARY KEY,
    attemptId VARCHAR(36) NOT NULL,   -- FK to exam_attempts.id
    questionId VARCHAR(36) NOT NULL,  -- FK to exam_questions.id
    answer TEXT NULL,                 -- Student's answer (JSON for complex types like matching)
    isCorrect BOOLEAN NULL,           -- Determined after grading (esp. for auto-graded Qs)
    points DECIMAL(5,2) NULL,         -- Points awarded for this answer
    feedback TEXT NULL,               -- Feedback specific to this answer
    answeredAt DATETIME NULL,         -- When the student answered this specific question
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attemptId) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES exam_questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_answer (attemptId, questionId),
    INDEX idx_questionId (questionId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZZES (Shorter, often formative assessments)
-- (Schema mirrors Exams structure closely, could potentially be merged or use a shared structure)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(36) PRIMARY KEY,
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id
    title VARCHAR(255) NOT NULL,
    description TEXT,
    timeLimit INT NULL,               -- In minutes, NULL for no limit
    passingScore DECIMAL(5,2) DEFAULT 60.00,
    attemptsAllowed INT DEFAULT 1,
    isRandomized BOOLEAN DEFAULT FALSE,
    showAnswers ENUM('immediately', 'after_deadline', 'manual', 'never') DEFAULT 'immediately',
    availableFrom DATETIME NULL,
    availableUntil DATETIME NULL,
    createdBy VARCHAR(36) NOT NULL,   -- FK to users.id
    status ENUM('draft', 'published', 'active', 'closed', 'archived') DEFAULT 'draft',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_class_status (classId, status),
    INDEX idx_availability (availableFrom, availableUntil)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZ QUESTIONS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS quiz_questions (
    id VARCHAR(36) PRIMARY KEY,
    quizId VARCHAR(36) NOT NULL,     -- FK to quizzes.id
    questionType ENUM('multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'matching') NOT NULL,
    questionText TEXT NOT NULL,
    options JSON,                   -- Same structure as exam_questions.options
    points DECIMAL(5,2) DEFAULT 1.00,
    orderIndex INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
    INDEX idx_quizId (quizId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZ ATTEMPTS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id VARCHAR(36) PRIMARY KEY,
    quizId VARCHAR(36) NOT NULL,      -- FK to quizzes.id
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id
    attemptNumber INT DEFAULT 1,
    startTime DATETIME NOT NULL,
    endTime DATETIME NULL,
    score DECIMAL(6,2) NULL,
    status ENUM('in_progress', 'completed', 'timed_out', 'graded') DEFAULT 'in_progress',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attempt (quizId, studentId, attemptNumber),
    INDEX idx_student_quiz (studentId, quizId),
    INDEX idx_status (status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- QUIZ ANSWERS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS quiz_answers (
    id VARCHAR(36) PRIMARY KEY,
    attemptId VARCHAR(36) NOT NULL,   -- FK to quiz_attempts.id
    questionId VARCHAR(36) NOT NULL,  -- FK to quiz_questions.id
    answer TEXT NULL,
    isCorrect BOOLEAN NULL,
    points DECIMAL(5,2) NULL,
    answeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (attemptId) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (questionId) REFERENCES quiz_questions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_answer (attemptId, questionId),
    INDEX idx_questionId (questionId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Support & Resources ===

-- FAQ (Frequently Asked Questions)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS faq (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    tags VARCHAR(255),
    viewCount INT DEFAULT 0,
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_school_category (schoolId, category),
    FULLTEXT INDEX idx_faq_search (question, answer, tags)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUPPORT TICKETS
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,    -- FK to users.id (Submitter)
    schoolId VARCHAR(36) NOT NULL,  -- FK to schools.id
    ticketNumber VARCHAR(20) UNIQUE, -- School-specific ticket number
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),          -- e.g., 'technical', 'billing', 'academic'
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'on_hold', 'resolved', 'closed') DEFAULT 'open',
    assignedTo VARCHAR(36) NULL,    -- FK to users.id (Support staff/admin)
    resolution TEXT,
    resolvedAt DATETIME NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE, -- If user deleted, tickets deleted? Or SET NULL?
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_user_status (userId, status),
    INDEX idx_school_status_priority (schoolId, status, priority),
    INDEX idx_assignedTo (assignedTo)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUPPORT MESSAGES (Replies within a support ticket)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS support_messages (
    id VARCHAR(36) PRIMARY KEY,
    ticketId VARCHAR(36) NOT NULL,  -- FK to support_tickets.id
    fromUserId VARCHAR(36) NOT NULL,-- FK to users.id (Sender)
    body TEXT NOT NULL,
    isInternalNote BOOLEAN DEFAULT FALSE, -- Note only visible to support staff
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachmentFileId VARCHAR(36) NULL, -- FK to file_storage.id
    FOREIGN KEY (ticketId) REFERENCES support_tickets(id) ON DELETE CASCADE, -- If ticket deleted, messages deleted
    FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE CASCADE, -- Or SET NULL?
    -- FOREIGN KEY (attachmentFileId) REFERENCES file_storage(id) ON DELETE SET NULL, -- Add later
    INDEX idx_ticket_sent (ticketId, sentAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LIBRARY RESOURCES (Digital library assets)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS library_resources (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    type ENUM('book', 'article', 'journal', 'thesis', 'video', 'audio', 'other') NOT NULL,
    format ENUM('pdf', 'epub', 'mp4', 'mp3', 'link', 'other') NOT NULL,
    fileId VARCHAR(36) NULL,     -- FK to file_storage.id (for uploaded resources)
    externalUrl VARCHAR(500) NULL,-- For linked resources
    uploadedBy VARCHAR(36) NOT NULL, -- FK to users.id
    departmentId VARCHAR(36) NULL, -- Optional FK to departments.id
    tags VARCHAR(255),
    isbn VARCHAR(20),
    publicationYear INT,
    publisher VARCHAR(100),
    isPublic BOOLEAN DEFAULT FALSE,
    -- accessRoles removed, use library_resource_roles
    downloadCount INT DEFAULT 0,
    viewCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploadedBy) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_school_type (schoolId, type),
    INDEX idx_isbn (isbn),
    INDEX idx_publicationYear (publicationYear),
    FULLTEXT INDEX idx_library_search (title, author, description, tags)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- LIBRARY RESOURCE ROLES (Junction table for role-based library access)
CREATE TABLE IF NOT EXISTS library_resource_roles (
    resourceId VARCHAR(36) NOT NULL, -- FK to library_resources.id
    roleId VARCHAR(36) NOT NULL,     -- FK to roles.id
    PRIMARY KEY (resourceId, roleId),
    FOREIGN KEY (resourceId) REFERENCES library_resources(id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES roles(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Calendar & Events ===

-- EVENTS (School calendar events)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    startTime DATETIME NOT NULL,
    endTime DATETIME NOT NULL,
    allDay BOOLEAN DEFAULT FALSE,
    eventType ENUM('class_session', 'exam', 'quiz_deadline', 'assignment_deadline', 'holiday', 'school_event', 'activity', 'meeting', 'personal', 'other') DEFAULT 'other',
    relatedEntityType VARCHAR(50), -- e.g., 'class', 'exam', 'assignment'
    relatedEntityId VARCHAR(36),
    color VARCHAR(20),           -- Hex color code for display
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    visibility ENUM('public', 'school', 'roles', 'groups', 'user') DEFAULT 'school',
    targetRoleIds TEXT,          -- Comma-separated role IDs if visibility='roles'
    targetGroupIds TEXT,         -- Comma-separated communication_group IDs if visibility='groups'
    recurrenceRule VARCHAR(255), -- iCal RRULE string
    parentEventId VARCHAR(36) NULL, -- FK to events.id for recurring event instances
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (parentEventId) REFERENCES events(id) ON DELETE CASCADE,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_school_time (schoolId, startTime, endTime),
    INDEX idx_eventType (eventType),
    INDEX idx_related_entity (relatedEntityType, relatedEntityId),
    INDEX idx_visibility (visibility)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Analytics & Reporting ===

-- PERFORMANCE METRICS (Aggregated student performance data)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS performance_metrics (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id (student user)
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id
    academicYear VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL,
    metricType ENUM('overall', 'attendance', 'assignments', 'exams', 'quizzes') NOT NULL,
    metricValue DECIMAL(10,2) NULL,   -- e.g., Average grade, attendance rate (%), completion rate (%)
    calculationDetails JSON,          -- How the metric was calculated, source data points
    calculatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_class_term_metric (studentId, classId, academicYear, term, metricType),
    INDEX idx_class_term_metric (classId, academicYear, term, metricType),
    INDEX idx_calculatedAt (calculatedAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PROGRESS TRACKING (Tracking specific skills or learning objectives)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS progress_tracking (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id
    classId VARCHAR(36) NULL,         -- Optional FK to classes.id
    courseId VARCHAR(36) NULL,        -- Optional FK to courses.id
    skillName VARCHAR(100) NOT NULL,  -- Name of the skill/objective being tracked
    skillCategory VARCHAR(100),
    currentLevel VARCHAR(50) NULL,    -- e.g., 'Beginner', 'Proficient', 'Mastered', or numeric scale
    targetLevel VARCHAR(50) NULL,
    assessmentDate DATETIME,
    assessedBy VARCHAR(36) NULL,      -- FK to users.id
    evidence TEXT,                    -- Description or link to evidence
    comments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (assessedBy) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_student_skill (studentId, classId, courseId, skillName),
    INDEX idx_student_category (studentId, skillCategory)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REPORTS (Definitions for generated reports)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('attendance_summary', 'grade_distribution', 'student_performance', 'financial_summary', 'enrollment_stats', 'custom') NOT NULL,
    parameters JSON,             -- Parameters needed to generate the report (e.g., date range, classId)
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    schedule VARCHAR(100) NULL,  -- Cron expression for scheduled generation
    lastRunStatus ENUM('success', 'failed', 'running', 'pending') NULL,
    lastRunAt TIMESTAMP NULL,
    defaultFormat ENUM('pdf', 'excel', 'csv', 'html') DEFAULT 'pdf',
    recipientEmails TEXT,        -- Comma-separated emails for scheduled delivery
    isActive BOOLEAN DEFAULT TRUE, -- For scheduled reports
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE, -- Add later
    INDEX idx_school_type (schoolId, type),
    INDEX idx_isActive_schedule (isActive, schedule)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REPORT INSTANCES (Stores generated report files)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS report_instances (
    id VARCHAR(36) PRIMARY KEY,
    reportId VARCHAR(36) NOT NULL, -- FK to reports.id
    fileId VARCHAR(36) NOT NULL,   -- FK to file_storage.id
    generatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generatedBy VARCHAR(36) NULL,  -- FK to users.id (if manually generated) or NULL for scheduled
    status ENUM('success', 'failed', 'partial') DEFAULT 'success',
    errorMessage TEXT NULL,
    parametersUsed JSON,           -- Parameters used for this specific instance
    expiresAt TIMESTAMP NULL,      -- Optional expiry for the generated file
    FOREIGN KEY (reportId) REFERENCES reports(id) ON DELETE CASCADE, -- If report definition deleted, instances deleted
    FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE CASCADE, -- If file deleted, instance record deleted? Maybe RESTRICT?
    FOREIGN KEY (generatedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_reportId_generated (reportId, generatedAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIT LOGS (Tracks significant actions within the system)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, -- Use BIGINT for high volume logs
    timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6), -- High precision timestamp
    userId VARCHAR(36) NULL,         -- FK to users.id (User performing action, NULL for system actions)
    schoolId VARCHAR(36) NULL,       -- FK to schools.id (Context)
    action VARCHAR(100) NOT NULL,    -- e.g., 'user_login', 'grade_updated', 'course_created'
    entityType VARCHAR(100) NULL,    -- e.g., 'user', 'grade', 'course'
    entityId VARCHAR(36) NULL,       -- ID of the affected entity
    oldValue TEXT NULL,              -- Previous state (e.g., JSON)
    newValue TEXT NULL,              -- New state (e.g., JSON)
    ipAddress VARCHAR(50) NULL,
    userAgent TEXT NULL,
    status ENUM('success', 'failure') DEFAULT 'success',
    details TEXT NULL,               -- Additional context or error message
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL, -- Add later
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_action (userId, action),
    INDEX idx_entity (entityType, entityId),
    INDEX idx_action_status (action, status)
    -- No default charset here, use DB default
);


-- === User Feedback & Preferences ===

-- FEEDBACK (Student/Parent feedback on teachers/courses/classes)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(36) PRIMARY KEY,
    submitterId VARCHAR(36) NOT NULL, -- FK to users.id (Student or Parent user)
    classId VARCHAR(36) NOT NULL,     -- FK to classes.id (Context for the feedback)
    teacherId VARCHAR(36) NOT NULL,   -- FK to teachers.userId (Teacher being reviewed)
    feedbackType ENUM('suggestion', 'comment', 'evaluation', 'complaint') DEFAULT 'comment',
    content TEXT NOT NULL,
    rating INT NULL,                 -- 1-5 scale if applicable
    isAnonymous BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'reviewed', 'addressed', 'dismissed') DEFAULT 'pending',
    reviewedBy VARCHAR(36) NULL,     -- FK to users.id (Admin/Head)
    reviewedAt TIMESTAMP NULL,
    reviewerComments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (submitterId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (teacherId) REFERENCES teachers(userId) ON DELETE CASCADE, -- If teacher deleted, feedback deleted? Or SET NULL?
    FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_class_teacher (classId, teacherId),
    INDEX idx_status (status),
    INDEX idx_feedbackType (feedbackType)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- USER SETTINGS (Individual user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    userId VARCHAR(36) PRIMARY KEY,    -- FK to users.id
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    language VARCHAR(10) DEFAULT 'en', -- ISO language code (e.g., 'en', 'es', 'fr')
    timezone VARCHAR(50) NULL,         -- e.g., 'America/New_York', user override for school default
    notificationsEnabled BOOLEAN DEFAULT TRUE,
    emailNotificationsEnabled BOOLEAN DEFAULT TRUE,
    pushNotificationsEnabled BOOLEAN DEFAULT TRUE,
    smsNotificationsEnabled BOOLEAN DEFAULT FALSE,
    notificationPreferences JSON,      -- Fine-grained control, e.g., {"new_grade": ["push", "email"], "announcement": ["push"]}
    calendarSyncEnabled BOOLEAN DEFAULT FALSE,
    calendarSyncProvider VARCHAR(50) NULL, -- e.g., 'google', 'outlook'
    calendarSyncToken TEXT NULL,
    dataUsageSettings JSON,            -- e.g., { "sync_over_wifi_only": true }
    lastSyncTime TIMESTAMP NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PARENT PREFERENCES (Specific notification/reporting preferences for parents)
CREATE TABLE IF NOT EXISTS parent_preferences (
    parentUserId VARCHAR(36) PRIMARY KEY, -- FK to parents.userId
    notifyOnAbsence BOOLEAN DEFAULT TRUE,
    notifyOnAbsenceThreshold INT DEFAULT 1, -- Notify after X absences
    notifyOnGradeBelow DECIMAL(5,2) NULL, -- Threshold grade, NULL to disable
    notifyOnAssignmentMissing BOOLEAN DEFAULT TRUE,
    notifyOnBehaviorIncident BOOLEAN DEFAULT TRUE,
    notifyOnBehaviorSeverity ENUM('minor', 'moderate', 'major', 'severe') DEFAULT 'moderate', -- Minimum severity to notify
    weeklySummaryReport BOOLEAN DEFAULT TRUE,
    monthlySummaryReport BOOLEAN DEFAULT FALSE,
    preferredContactTime VARCHAR(50) DEFAULT 'any', -- e.g., 'morning', 'afternoon', 'evening'
    preferredContactDay ENUM('weekdays', 'weekends', 'any') DEFAULT 'any',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parentUserId) REFERENCES parents(userId) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Multi-Tenancy & Configuration ===

-- SCHOOLS (For multi-institution support)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS schools (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    stateProvince VARCHAR(100),
    postalCode VARCHAR(20),
    country VARCHAR(100),
    contactEmail VARCHAR(255),
    contactPhone VARCHAR(30),
    website VARCHAR(255),
    logoFileId VARCHAR(36) NULL, -- FK to file_storage.id
    type ENUM('preschool', 'primary', 'middle', 'high', 'k12', 'university', 'college', 'training', 'other') DEFAULT 'other',
    timezone VARCHAR(50) DEFAULT 'UTC',
    academicYearStartMonth INT DEFAULT 8, -- e.g., 8 for August
    academicYearStartDay INT DEFAULT 15,
    gradeSystem ENUM('percentage', 'letter', 'gpa4', 'gpa5', 'custom') DEFAULT 'percentage',
    gradingScale JSON NULL,       -- Definition if gradeSystem is 'custom' or specific scales
    featureFlags JSON NULL,       -- e.g., {"enable_library": true, "enable_payments": false}
    subscriptionPlan VARCHAR(50) NULL,
    subscriptionStatus ENUM('trial', 'active', 'past_due', 'cancelled', 'expired') DEFAULT 'trial',
    subscriptionEndDate DATE NULL,
    maxStudents INT NULL,
    maxTeachers INT NULL,
    customSettings JSON NULL,     -- School-specific overrides or settings
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (logoFileId) REFERENCES file_storage(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_country_type (country, type),
    INDEX idx_subscriptionStatus (subscriptionStatus)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK constraints now that schools table exists
ALTER TABLE users ADD CONSTRAINT fk_user_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL;
ALTER TABLE departments ADD CONSTRAINT fk_dept_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE announcements ADD CONSTRAINT fk_announcement_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE communication_groups ADD CONSTRAINT fk_commgroup_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE financial_transactions ADD CONSTRAINT fk_finTrans_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE RESTRICT;
ALTER TABLE payment_plans ADD CONSTRAINT fk_payPlan_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE faq ADD CONSTRAINT fk_faq_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE support_tickets ADD CONSTRAINT fk_support_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE library_resources ADD CONSTRAINT fk_libRes_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE events ADD CONSTRAINT fk_event_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE reports ADD CONSTRAINT fk_report_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_school FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE SET NULL;

-- LOCALIZATIONS (For multi-language support in UI)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS localizations (
    id VARCHAR(36) PRIMARY KEY,
    locale VARCHAR(10) NOT NULL,     -- e.g., 'en', 'en-US', 'es-MX'
    namespace VARCHAR(50) NOT NULL DEFAULT 'common', -- Group translations (e.g., 'validation', 'navigation')
    keyName VARCHAR(255) NOT NULL,   -- The translation key (e.g., 'error.requiredField')
    value TEXT NOT NULL,             -- The translated string
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_translation (locale, namespace, keyName),
    INDEX idx_locale_namespace (locale, namespace)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOCUMENT TEMPLATES (For generating certificates, reports, letters)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS document_templates (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL, -- FK to schools.id
    name VARCHAR(255) NOT NULL,
    type ENUM('certificate', 'transcript', 'report_card', 'letter', 'invoice', 'custom') NOT NULL,
    format ENUM('html', 'markdown', 'pdf_template') DEFAULT 'html',
    content TEXT NOT NULL,         -- Template body with placeholders (e.g., {{student.name}})
    availableVariables JSON NULL,  -- Description of variables usable in the template
    createdBy VARCHAR(36) NOT NULL, -- FK to users.id
    isDefault BOOLEAN DEFAULT FALSE, -- Default template for this type/school
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_school_template_name (schoolId, name),
    INDEX idx_school_type_default (schoolId, type, isDefault)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CERTIFICATES (Issued certificates, potentially generated from templates)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,      -- FK to users.id (Recipient)
    classId VARCHAR(36) NULL,         -- Optional FK to classes.id
    courseId VARCHAR(36) NULL,        -- Optional FK to courses.id
    type VARCHAR(100) NOT NULL,       -- e.g., 'Completion', 'Participation', 'Honors'
    description TEXT,
    issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    issuedBy VARCHAR(36) NOT NULL,    -- FK to users.id
    fileId VARCHAR(36) NULL,          -- FK to file_storage.id (The generated certificate file)
    templateId VARCHAR(36) NULL,      -- Optional FK to document_templates.id used
    verificationCode VARCHAR(64) UNIQUE NULL, -- Code for external verification
    qrCodeFileId VARCHAR(36) NULL,    -- Optional FK to file_storage for a QR code image
    isValid BOOLEAN DEFAULT TRUE,
    expiresAt DATE NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (issuedBy) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (fileId) REFERENCES file_storage(id) ON DELETE SET NULL,
    FOREIGN KEY (templateId) REFERENCES document_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (qrCodeFileId) REFERENCES file_storage(id) ON DELETE SET NULL,
    INDEX idx_user_type (userId, type),
    INDEX idx_verificationCode (verificationCode)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === System & Security ===

-- DEVICE TOKENS (For push notifications)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS device_tokens (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,     -- FK to users.id
    token TEXT NOT NULL,             -- The device token (can be long)
    platform ENUM('ios', 'android', 'web_push') NOT NULL,
    deviceInfo TEXT NULL,            -- e.g., Model, OS version
    lastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_token (userId, token(255)), -- Index prefix for TEXT field
    INDEX idx_platform (platform),
    INDEX idx_lastUsedAt (lastUsedAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- API KEYS (For third-party integrations)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,      -- FK to users.id (Owner of the key)
    schoolId VARCHAR(36) NOT NULL,    -- FK to schools.id (Scope of the key)
    apiKeyHash VARCHAR(255) UNIQUE NOT NULL, -- Store hash, not the key itself
    prefix VARCHAR(8) UNIQUE NOT NULL, -- Short prefix for identification (like sk_...)
    name VARCHAR(100) NOT NULL,
    scopes TEXT NOT NULL,             -- Comma-separated list of allowed permissions/scopes
    expiresAt TIMESTAMP NULL,
    lastUsedAt TIMESTAMP NULL,
    lastUsedIp VARCHAR(50) NULL,
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_schoolId (schoolId),
    INDEX idx_isActive (isActive)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WEBHOOKS (For sending notifications to external systems)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,      -- FK to users.id (Creator)
    schoolId VARCHAR(36) NOT NULL,    -- FK to schools.id (Scope)
    targetUrl VARCHAR(500) NOT NULL,
    events TEXT NOT NULL,             -- Comma-separated list of events to trigger (e.g., 'grade.created', 'enrollment.updated')
    secret VARCHAR(255) NULL,         -- Secret for verifying payload signature
    isActive BOOLEAN DEFAULT TRUE,
    lastDeliveryStatus ENUM('pending', 'success', 'failed') NULL,
    lastDeliveryAt TIMESTAMP NULL,
    failCount INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_active (schoolId, isActive),
    INDEX idx_events (events(255)) -- Index prefix for TEXT field
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- WEBHOOK DELIVERIES (Log of webhook delivery attempts)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id VARCHAR(36) PRIMARY KEY,
    webhookId VARCHAR(36) NOT NULL, -- FK to webhooks.id
    eventId VARCHAR(36) NULL,     -- Optional link to the event that triggered it (e.g., audit log ID)
    eventPayload TEXT NOT NULL,
    attemptAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responseStatusCode INT NULL,
    responseBody TEXT NULL,
    status ENUM('pending', 'success', 'failed', 'retrying') NOT NULL,
    durationMs INT NULL,          -- Time taken for the attempt in milliseconds
    FOREIGN KEY (webhookId) REFERENCES webhooks(id) ON DELETE CASCADE,
    INDEX idx_webhook_status_time (webhookId, status, attemptAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUTH LOGS (Security logs for authentication events)
-- Note: id is BIGINT for high volume
CREATE TABLE IF NOT EXISTS auth_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    userId VARCHAR(36) NULL,         -- FK to users.id (NULL for failed logins with unknown user)
    schoolId VARCHAR(36) NULL,       -- FK to schools.id
    ipAddress VARCHAR(50) NOT NULL,
    userAgent TEXT NULL,
    action ENUM('login_success', 'login_failure', 'logout', 'password_reset_request', 'password_reset_success', 'token_refresh', '2fa_attempt', 'api_key_used') NOT NULL,
    status ENUM('success', 'failure') NOT NULL, -- Redundant? Action implies status often. Keep for clarity.
    details TEXT NULL,               -- e.g., Failure reason, token type
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools.id ON DELETE SET NULL, -- Add later
    INDEX idx_timestamp (timestamp),
    INDEX idx_user_action (userId, action),
    INDEX idx_ip_action (ipAddress, action, timestamp),
    INDEX idx_action_status (action, status)
    -- No default charset here, use DB default
);


-- === GDPR & Privacy ===

-- DATA PRIVACY CONSENTS (Tracking user consent)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS data_privacy_consents (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,     -- FK to users.id
    consentType VARCHAR(100) NOT NULL,-- e.g., 'terms_of_service', 'privacy_policy', 'marketing_emails'
    consentVersion VARCHAR(20) NOT NULL,-- Version of the document consented to
    status ENUM('granted', 'revoked', 'expired') NOT NULL,
    grantedAt TIMESTAMP NULL,        -- When consent was initially granted
    revokedAt TIMESTAMP NULL,
    ipAddress VARCHAR(50),
    userAgent TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE CASCADE,
    UNIQUE KEY unique_consent (userId, consentType, consentVersion), -- Allow multiple versions, but only one status per version
    INDEX idx_user_type_status (userId, consentType, status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DATA EXPORT REQUESTS (Tracking GDPR data export requests)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS data_export_requests (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,     -- FK to users.id
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    format ENUM('json', 'csv') DEFAULT 'json',
    fileId VARCHAR(36) NULL,         -- FK to file_storage.id (The generated export file)
    expiresAt TIMESTAMP NULL,        -- When the download link/file expires
    completedAt TIMESTAMP NULL,
    failureReason TEXT NULL,
    processedBy VARCHAR(36) NULL,    -- FK to users.id (Admin who processed)
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE CASCADE,
    FOREIGN KEY (fileId) REFERENCES file_storage.id ON DELETE SET NULL,
    FOREIGN KEY (processedBy) REFERENCES users.id ON DELETE SET NULL,
    INDEX idx_user_status (userId, status),
    INDEX idx_status (status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DATA DELETION REQUESTS (Tracking GDPR data deletion requests)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS data_deletion_requests (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,     -- FK to users.id
    requestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'completed', 'rejected', 'failed') DEFAULT 'pending',
    rejectionReason TEXT NULL,
    processedBy VARCHAR(36) NULL,    -- FK to users.id (Admin who processed)
    completedAt TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE CASCADE, -- Should this cascade? If user is deleted, request is irrelevant?
    FOREIGN KEY (processedBy) REFERENCES users.id ON DELETE SET NULL,
    INDEX idx_user_status (userId, status),
    INDEX idx_status (status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- === Miscellaneous ===

-- TEACHER WORKLOAD (Tracking assigned hours/load)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS teacher_workload (
    id VARCHAR(36) PRIMARY KEY,
    teacherId VARCHAR(36) NOT NULL,   -- FK to teachers.userId
    academicYear VARCHAR(9) NOT NULL,
    term VARCHAR(20) NOT NULL,
    totalAssignedHours DECIMAL(5,2) DEFAULT 0.00, -- Weekly teaching hours
    nonTeachingHours DECIMAL(5,2) DEFAULT 0.00, -- Meetings, prep etc.
    maxHours DECIMAL(5,2) DEFAULT 40.00,-- From teacher profile or school setting
    overloadHours DECIMAL(5,2) GENERATED ALWAYS AS (GREATEST(0, totalAssignedHours + nonTeachingHours - maxHours)) STORED,
    assignedClassCount INT DEFAULT 0,
    assignedStudentCount INT DEFAULT 0,
    calculationDetails JSON,          -- e.g., List of classes contributing to hours
    lastCalculatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (teacherId) REFERENCES teachers(userId) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_term (teacherId, academicYear, term),
    INDEX idx_year_term (academicYear, term)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BEHAVIOR INCIDENTS (Tracking student discipline issues)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS behavior_incidents (
    id VARCHAR(36) PRIMARY KEY,
    studentId VARCHAR(36) NOT NULL,   -- FK to users.id (student user)
    reportedBy VARCHAR(36) NOT NULL,  -- FK to users.id (teacher/staff)
    schoolId VARCHAR(36) NOT NULL,    -- FK to schools.id
    incidentDate DATETIME NOT NULL,
    location VARCHAR(100),
    category ENUM('disruption', 'academic_dishonesty', 'bullying', 'violence', 'vandalism', 'substance_abuse', 'attendance', 'dress_code', 'other') NOT NULL,
    severity ENUM('minor', 'moderate', 'major', 'severe') NOT NULL,
    description TEXT NOT NULL,
    witnesses TEXT,                   -- Names or description of witnesses
    actionTaken TEXT,                 -- Immediate action taken
    status ENUM('reported', 'under_review', 'resolved', 'appealed', 'dismissed') DEFAULT 'reported',
    resolution TEXT,                  -- Final outcome/resolution
    resolvedBy VARCHAR(36) NULL,      -- FK to users.id
    resolvedAt DATETIME NULL,
    parentNotified BOOLEAN DEFAULT FALSE,
    parentNotifiedAt DATETIME NULL,
    linkedIncidentId VARCHAR(36) NULL,-- Link related incidents FK to behavior_incidents.id
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE, -- Or RESTRICT?
    FOREIGN KEY (reportedBy) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (resolvedBy) REFERENCES users.id ON DELETE SET NULL,
    FOREIGN KEY (linkedIncidentId) REFERENCES behavior_incidents(id) ON DELETE SET NULL,
    -- FOREIGN KEY (schoolId) REFERENCES schools.id ON DELETE CASCADE, -- Add later
    INDEX idx_student_date (studentId, incidentDate),
    INDEX idx_school_status_category (schoolId, status, category),
    INDEX idx_reportedBy (reportedBy),
    INDEX idx_severity (severity)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYNC STATUS (For mobile offline data synchronization)
-- Note: id is VARCHAR(36) intended for UUIDs
CREATE TABLE IF NOT EXISTS sync_status (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,         -- FK to users.id
    deviceId VARCHAR(100) NOT NULL,      -- Identifier for the specific device
    entityType VARCHAR(50) NOT NULL,     -- e.g., 'class', 'assignment', 'grade'
    lastSyncedVersion BIGINT DEFAULT 0,  -- Could be timestamp, version number, or sequence ID
    lastSyncedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    syncDirection ENUM('up', 'down') NOT NULL, -- Uploading device changes or downloading server changes
    syncStatus ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    errorMessage TEXT NULL,
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE CASCADE,
    UNIQUE KEY unique_user_device_entity (userId, deviceId, entityType),
    INDEX idx_user_device_status (userId, deviceId, syncStatus)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SYSTEM METRICS (For application performance monitoring)
-- Note: id is BIGINT for high volume
CREATE TABLE IF NOT EXISTS system_metrics (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    metricName VARCHAR(100) NOT NULL, -- e.g., 'db_query_time', 'api_response_time', 'active_users'
    metricValue DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NULL,           -- e.g., 'ms', 'count', 'percent'
    tags JSON NULL,                  -- Key-value pairs for context (e.g., {"endpoint": "/api/grades", "host": "server1"})
    INDEX idx_timestamp_name (timestamp, metricName)
    -- No default charset here, use DB default
);

-- FEATURE USAGE (Tracking adoption/usage of specific features)
-- Note: id is BIGINT for high volume
CREATE TABLE IF NOT EXISTS feature_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    featureName VARCHAR(100) NOT NULL,
    userId VARCHAR(36) NOT NULL,     -- FK to users.id
    schoolId VARCHAR(36) NULL,       -- FK to schools.id
    usageCount INT DEFAULT 1,
    firstUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    context JSON NULL,               -- Additional context about the usage
    FOREIGN KEY (userId) REFERENCES users.id ON DELETE CASCADE,
    -- FOREIGN KEY (schoolId) REFERENCES schools.id ON DELETE SET NULL, -- Add later
    UNIQUE KEY unique_feature_user (featureName, userId), -- Track per user
    INDEX idx_feature_school (featureName, schoolId),
    INDEX idx_lastUsedAt (lastUsedAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Initial Data ===

-- Initialize basic roles (use INSERT IGNORE to avoid errors if they already exist)
INSERT IGNORE INTO roles (id, name, description) VALUES
('d8b8a7e4-7c9a-11ee-b962-0242ac120002', 'super_admin', 'System super administrator with cross-school access'),
('df0f3a7a-7c9a-11ee-b962-0242ac120002', 'admin', 'School administrator with full access within their school'),
('e1b4e2e4-7c9a-11ee-b962-0242ac120002', 'teacher', 'Teacher/instructor role'),
('e45f6f8a-7c9a-11ee-b962-0242ac120002', 'student', 'Student role'),
('e705a9be-7c9a-11ee-b962-0242ac120002', 'parent', 'Parent/guardian role'),
('e959a71e-7c9a-11ee-b962-0242ac120002', 'support_staff', 'Support role with access to tickets etc.');

-- Note: Using fixed UUIDs here for consistency in initial setup. Use UUID() for dynamic generation.

-- === Real-time Sync Support ===
CREATE TABLE IF NOT EXISTS sync_logs (
    id VARCHAR(36) PRIMARY KEY,
    entityType VARCHAR(50) NOT NULL,
    entityId VARCHAR(36) NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    deviceId VARCHAR(100),
    userId VARCHAR(36) NOT NULL,
    syncStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    errorMessage TEXT,
    retryCount INT DEFAULT 0,
    lastRetryAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_entity (entityType, entityId),
    INDEX idx_sync_status (syncStatus)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS device_sync_status (
    id VARCHAR(36) PRIMARY KEY,
    deviceId VARCHAR(100) NOT NULL,
    userId VARCHAR(36) NOT NULL,
    lastSyncAt TIMESTAMP NULL,
    lastSuccessfulSyncAt TIMESTAMP NULL,
    syncErrors TEXT,
    offlineOperations JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_device_user (deviceId, userId)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Live Chat Support ===
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    supportAgentId VARCHAR(36),
    sessionType ENUM('support', 'general', 'academic') DEFAULT 'support',
    status ENUM('waiting', 'active', 'on_hold', 'closed') DEFAULT 'waiting',
    subject VARCHAR(255),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    startedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endedAt TIMESTAMP NULL,
    rating INT,
    feedback TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supportAgentId) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status_priority (status, priority),
    INDEX idx_agent_status (supportAgentId, status)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    sessionId VARCHAR(36) NOT NULL,
    senderId VARCHAR(36) NOT NULL,
    messageType ENUM('text', 'file', 'system') DEFAULT 'text',
    content TEXT NOT NULL,
    attachmentId VARCHAR(36),
    isRead BOOLEAN DEFAULT FALSE,
    readAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES chat_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_time (sessionId, createdAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- === Advanced Reporting Support ===
CREATE TABLE IF NOT EXISTS report_templates (
    id VARCHAR(36) PRIMARY KEY,
    schoolId VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('academic', 'attendance', 'financial', 'administrative') NOT NULL,
    template JSON NOT NULL,
    parameters JSON,
    createdBy VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_school_type (schoolId, type)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS generated_reports (
    id VARCHAR(36) PRIMARY KEY,
    templateId VARCHAR(36) NOT NULL,
    generatedBy VARCHAR(36) NOT NULL,
    fileId VARCHAR(36),
    parameters JSON,
    status ENUM('processing', 'completed', 'failed') DEFAULT 'processing',
    errorMessage TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL,
    FOREIGN KEY (templateId) REFERENCES report_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (generatedBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status_date (status, createdAt)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;