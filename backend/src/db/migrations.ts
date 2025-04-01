import { pool, query } from '../config/db';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { createParentRelationshipTable } from '../migrations/create-parent-relationship-table';
import { createUsersTable } from '../migrations/create-users-table';
import { createCoursesTable } from '../migrations/create-courses-table';
import { createCourseEnrollmentsTable } from '../migrations/create-course-enrollments-table';
import { createAssignmentsTable } from '../migrations/create-assignments-table';
import { createSubmissionsTable } from '../migrations/create-submissions-table';
import { createDepartmentsTable } from '../migrations/create-departments-table';
import { createAttendanceTable } from '../migrations/create-attendance-table';
import { createClassesTable } from '../migrations/create-classes-table';
import { createClassSchedulesTable } from '../migrations/create-class-schedules-table';
import { createDocumentsTable } from '../migrations/create-documents-table';
import { createGradesTable } from '../migrations/create-grades-table';
import { createMaterialsTable } from '../migrations/create-materials-table';
import { createFeedbackTable } from '../migrations/create-feedback-table';
import { createParentChildTable } from '../migrations/create-parent-child-table';
import { createMessagesTable } from '../migrations/create-messages-table';

interface Migration {
  name: string;
  description: string;
  execute: () => Promise<void>;
  priority: number; // Lower numbers run first
}

// List of all migrations in the system
const migrations: Migration[] = [
  {
    name: 'create_migrations_table',
    description: 'Creates the migrations tracking table',
    priority: 0,
    execute: async () => {
      const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          success BOOLEAN NOT NULL DEFAULT TRUE,
          error_message TEXT
        );
      `;
      await query(sql);
    }
  },
  {
    name: 'create_users_table',
    description: 'Creates the users table',
    priority: 5,
    execute: createUsersTable
  },
  {
    name: 'create_departments_table',
    description: 'Creates the departments table',
    priority: 5,
    execute: createDepartmentsTable
  },
  {
    name: 'create_courses_table',
    description: 'Creates the courses table',
    priority: 8,
    execute: createCoursesTable
  },
  {
    name: 'create_classes_table',
    description: 'Creates the classes table',
    priority: 15,
    execute: createClassesTable
  },
  {
    name: 'create_class_schedules_table',
    description: 'Creates the class schedules table',
    priority: 20,
    execute: createClassSchedulesTable
  },
  {
    name: 'create_course_enrollments_table',
    description: 'Creates the course enrollments table',
    priority: 15,
    execute: createCourseEnrollmentsTable
  },
  {
    name: 'create_assignments_table',
    description: 'Creates the assignments table',
    priority: 20,
    execute: createAssignmentsTable
  },
  {
    name: 'create_submissions_table',
    description: 'Creates the submissions table',
    priority: 25,
    execute: createSubmissionsTable
  },
  {
    name: 'create_grades_table',
    description: 'Creates the grades table',
    priority: 40,
    execute: createGradesTable
  },
  {
    name: 'create_attendance_table',
    description: 'Creates the attendance table',
    priority: 30,
    execute: createAttendanceTable
  },
  {
    name: 'create_parent_relationship_table',
    description: 'Creates the parent relationship table',
    priority: 40,
    execute: createParentRelationshipTable
  },
  {
    name: 'create_parent_child_table',
    description: 'Creates the parent-child relationship table',
    priority: 50,
    execute: createParentChildTable
  },
  {
    name: 'create_documents_table',
    description: 'Creates the documents table',
    priority: 35,
    execute: createDocumentsTable
  },
  {
    name: 'create_materials_table',
    description: 'Creates the materials table',
    priority: 25,
    execute: createMaterialsTable
  },
  {
    name: 'create_feedback_table',
    description: 'Creates the feedback table',
    priority: 45,
    execute: createFeedbackTable
  },
  {
    name: 'create_messages_table',
    description: 'Creates the messages table',
    priority: 55,
    execute: createMessagesTable
  }
  // Add more migrations here
];

// Check if a migration has already been executed
async function isMigrationExecuted(name: string): Promise<boolean> {
  try {
    // Check if the migrations table exists first
    const tableExists = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'migrations'
    `);
    
    if (!tableExists || !tableExists[0] || tableExists[0].count === 0) {
      return false;
    }
    
    const results = await query('SELECT * FROM migrations WHERE name = ? AND success = TRUE', [name]);
    return results.length > 0;
  } catch (error) {
    // If there's an error, it's likely because the migrations table doesn't exist yet
    return false;
  }
}

// Record a completed migration
async function recordMigration(name: string, success: boolean, errorMessage?: string): Promise<void> {
  try {
    if (success) {
      await query('INSERT INTO migrations (name, success) VALUES (?, ?)', [name, success]);
    } else {
      await query('INSERT INTO migrations (name, success, error_message) VALUES (?, ?, ?)', 
        [name, success, errorMessage || 'Unknown error']);
    }
  } catch (error) {
    logger.error(`Failed to record migration status for ${name}`, error);
  }
}

// Run all pending migrations
export async function runMigrations(): Promise<void> {
  logger.startup('Starting database migrations...');
  
  // Sort migrations by priority
  const sortedMigrations = [...migrations].sort((a, b) => a.priority - b.priority);
  
  // Track overall success
  let success = true;
  
  // Execute migrations in order
  for (const migration of sortedMigrations) {
    try {
      // Check if already executed
      const alreadyExecuted = await isMigrationExecuted(migration.name);
      
      if (alreadyExecuted) {
        logger.info(`Migration '${migration.name}' already executed, skipping`);
        continue;
      }
      
      logger.startup(`Executing migration: ${migration.name} - ${migration.description}`);
      
      // Execute the migration
      await migration.execute();
      
      // Record successful migration
      await recordMigration(migration.name, true);
      
      logger.startup(`Migration '${migration.name}' completed successfully`);
    } catch (error) {
      success = false;
      logger.error(`Migration '${migration.name}' failed:`, error);
      
      // Record failed migration
      await recordMigration(migration.name, false, 
        error instanceof Error ? error.message : 'Unknown error');
      
      // Only stop on the first failure for core migrations (priority < 100)
      if (migration.priority < 100) {
        throw error;
      }
    }
  }
  
  if (success) {
    logger.startup('All migrations completed successfully');
  } else {
    logger.warn('Some migrations were skipped due to errors');
  }
}

// Check if database is properly migrated
export async function checkMigrations(): Promise<boolean> {
  try {
    // Count total and executed migrations
    const total = migrations.length;
    let executed = 0;
    
    for (const migration of migrations) {
      if (await isMigrationExecuted(migration.name)) {
        executed++;
      }
    }
    
    // Return true if all migrations have been executed
    return executed === total;
  } catch (error) {
    logger.error('Failed to check migration status', error);
    return false;
  }
}

// Direct execution (when run directly with ts-node)
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration script failed', error);
      process.exit(1);
    });
} 