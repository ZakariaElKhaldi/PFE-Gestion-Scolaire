// This is a simplified email utility
// In a real application, you would use a library like nodemailer or an email service API

import nodemailer from 'nodemailer';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

// This creates a reusable transporter object
const createTransporter = () => {
  // If we have SMTP credentials, use them
  if (!config.email.useFakeMailService) {
    logger.info('[EmailService] Using real email transport with configured SMTP settings');
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });
  } 
  
  // For development without SMTP credentials, use a test account
  logger.info('[EmailService] Using ethereal fake email service for development');
  return new Promise<nodemailer.Transporter>(async (resolve, reject) => {
    try {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();
      logger.info('[EmailService] Created test email account', { email: testAccount.user });
      
      // Create a test transporter
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      resolve(transporter);
    } catch (error) {
      logger.error('[EmailService] Failed to create test email account', { error });
      // Fall back to fake transport that just logs
      resolve(createFakeTransport());
    }
  });
};

// This creates a fake transport that just logs emails
const createFakeTransport = () => {
  logger.info('[EmailService] Using fake email transport (logging only)');
  return {
    sendMail: (options: any) => {
      logger.info('[EmailService] FAKE EMAIL SENDING:', {
        to: options.to,
        subject: options.subject,
        previewUrl: 'No preview URL available (fake transport)'
      });
      logger.debug('[EmailService] Email content:', { html: options.html });
      return Promise.resolve({
        messageId: `fake-${Date.now()}`,
        response: 'Fake email logged instead of sent'
      });
    }
  } as unknown as nodemailer.Transporter;
};

// Cache the transporter to avoid creating it on every email
let transporter: nodemailer.Transporter | null = null;

/**
 * Sends an email using nodemailer
 * If no SMTP credentials are provided in a development environment,
 * it will use Ethereal for testing or fall back to logging only
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // Create transporter if it doesn't exist
    if (!transporter) {
      transporter = await createTransporter() as nodemailer.Transporter;
    }

    // Set up email data
    const mailOptions = {
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    
    // Log email send status
    logger.info('[EmailService] Email sent successfully', { 
      messageId: info.messageId,
      to: options.to,
      subject: options.subject 
    });

    // If using Ethereal, provide preview URL
    if (info.messageId && info.messageId.includes('ethereal')) {
      logger.info('[EmailService] Preview URL:', { 
        url: nodemailer.getTestMessageUrl(info) 
      });
    }
  } catch (error) {
    logger.error('[EmailService] Failed to send email', { 
      error,
      to: options.to,
      subject: options.subject 
    });
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}

/**
 * Load and populate an email template with replacements
 * @param templateName The name of the template to load
 * @param replacements An object with key-value pairs for replacements in the template
 * @returns The template HTML with replacements
 */
export function loadEmailTemplate(templateName: string, replacements: Record<string, string>): string {
  try {
    let templatePath = path.join(__dirname, `../templates/emails/${templateName}.html`);
    
    // For development, check if the template exists
    if (!fs.existsSync(templatePath)) {
      logger.warn(`[EmailService] Template ${templateName} not found at ${templatePath}`);
      
      // Use a default template if the requested one doesn't exist
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>School Management System</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4a6cf7; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>School Management System</h1>
            </div>
            <div class="content">
              <p>Hello ${replacements.parentName || 'Parent/Guardian'},</p>
              <p>${replacements.studentName || 'A student'} has added you as their parent/guardian in our school management system.</p>
              <p>Please click the button below to verify this relationship:</p>
              <p><a href="${replacements.verificationLink || '#'}" class="button">Verify Relationship</a></p>
              <p>If you don't want to verify this relationship, you can <a href="${replacements.rejectLink || '#'}">reject it here</a>.</p>
              <p>This link will expire in 48 hours.</p>
            </div>
            <div class="footer">
              <p>© ${replacements.currentYear || new Date().getFullYear()} School Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    // Read the template file
    let template = fs.readFileSync(templatePath, 'utf8');
    
    // Replace all placeholders
    Object.keys(replacements).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, replacements[key]);
    });
    
    return template;
  } catch (error) {
    logger.error(`[EmailService] Error loading email template: ${error}`);
    
    // Return a simple fallback template
    return `
      <h1>School Management System</h1>
      <p>Hello ${replacements.parentName || 'there'},</p>
      <p>Please click <a href="${replacements.verificationLink || '#'}">here</a> to verify your relationship with ${replacements.studentName || 'the student'}.</p>
      <p>© ${replacements.currentYear || new Date().getFullYear()} School Management System</p>
    `;
  }
} 