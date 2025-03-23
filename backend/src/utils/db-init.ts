import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';
import { logger } from './logger';
import { runMigrations, checkMigrations } from '../db/migrations';
import { userModel } from '../models/user.model';
import { courseModel } from '../models/course.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';
import { classModel } from '../models/class.model';
import { classScheduleModel } from '../models/class-schedule.model';
import { attendanceModel } from '../models/attendance.model';
import { createDocumentsTableSQL } from '../models/document.model';
import { createSubmissionsTableSQL } from '../models/submission.model';
import { paymentModel } from '../models/payment.model';
import { materialModel } from '../models/material.model';
import { feedbackModel, FeedbackModel } from '../models/feedback.model';
import { certificateModel } from '../models/certificate.model';
import { userSettingsModel } from '../models/user-settings.model';
import { systemSettingsModel } from '../models/system-settings.model';
import { securitySettingsModel } from '../models/security-settings.model';
import { SettingsService } from '../services/settings.service';

/**
 * Initialize database tables
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    logger.startup('Initializing database...');
    
    // First, run migrations (this will create the migrations table and track all migrations)
    try {
      await runMigrations();
    } catch (error) {
      logger.error('Failed to run migrations', error);
      throw new Error('Database migration failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    
    // Check if database is properly migrated
    const migrated = await checkMigrations();
    if (!migrated) {
      logger.warn('Database is not fully migrated. Some features may not work properly.');
    }
    
    // Path to the schema file
    const schemaPath = path.join(__dirname, '../../db/schema.sql');
    
    // If schema file exists and database isn't fully migrated, try applying it
    if (fs.existsSync(schemaPath) && !migrated) {
      logger.info('Using schema file for remaining database initialization...');
      
      try {
        // Read the schema file
        const sql = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema (will only create tables that don't exist)
        await pool.query(sql);
        logger.info('Schema applied successfully');
      } catch (error) {
        logger.error('Error executing schema', error);
        logger.info('Falling back to direct table creation');
        await createTablesDirectly();
      }
    } else if (!migrated) {
      logger.info('Schema file not found or migrations incomplete, creating tables directly...');
      await createTablesDirectly();
    }
    
    logger.startup('Database initialization completed');
  } catch (error) {
    logger.error('Failed to initialize database', error);
    throw error;
  }
};

/**
 * Create database tables directly, in proper order
 */
async function createTablesDirectly(): Promise<void> {
  try {
    // Create tables in the correct order (respecting foreign key constraints)
    await userModel.createTable();
    logger.db('Users table created or verified');
    
    await courseModel.createTable();
    logger.db('Courses table created or verified');
    
    await courseEnrollmentModel.createTable();
    logger.db('Course enrollments table created or verified');
    
    await classModel.createTable();
    logger.db('Classes table created or verified');
    
    await classScheduleModel.createTable();
    logger.db('Class schedules table created or verified');
    
    await attendanceModel.createTable();
    logger.db('Attendance table created or verified');
    
    await pool.query(createDocumentsTableSQL);
    logger.db('Documents table created or verified');
    
    await pool.query(createSubmissionsTableSQL);
    logger.db('Submissions table created or verified');
    
    await paymentModel.createTable();
    logger.db('Payments table created or verified');
    
    await paymentModel.createInvoicesTable();
    logger.db('Invoices table created or verified');
    
    await paymentModel.createPaymentMethodsTable();
    logger.db('Payment methods table created or verified');
    
    await materialModel.createTable();
    logger.db('Materials table created or verified');
    
    await materialModel.createProgressTable();
    logger.db('Material progress table created or verified');
    
    await FeedbackModel.createTable();
    logger.db('Feedback table created or verified');
    
    await certificateModel.createTable();
    logger.db('Certificates table created or verified');
    
    // Initialize settings tables
    const settingsService = new SettingsService();
    await settingsService.initializeTables();
    logger.db('Settings tables created or verified');
    
    logger.info('All tables created successfully');
  } catch (error) {
    logger.error('Error creating tables directly', error);
    throw new Error('Failed to create database tables: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
} 