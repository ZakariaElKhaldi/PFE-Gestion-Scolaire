import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
      }
    });
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email?token=${token}`;
      
      const mailOptions = {
        from: config.email.from,
        to: email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to School Management System!</h2>
            <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't sign up for an account, please ignore this email.</p>
            <p>Best regards,<br>School Management System Team</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send parent invitation email
   */
  async sendParentInvitationEmail(parentEmail: string, studentName: string, token: string): Promise<boolean> {
    try {
      const invitationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/parent-verification?token=${token}`;
      
      const mailOptions = {
        from: config.email.from,
        to: parentEmail,
        subject: `Parent Account Invitation for ${studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>School Management System - Parent Account</h2>
            <p>Hello,</p>
            <p>Your child, ${studentName}, has registered for an account in our School Management System and has listed you as their parent/guardian.</p>
            <p>To verify this relationship and access your child's academic information, please click the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Parent Relationship
              </a>
            </div>
            <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
            <p><a href="${invitationUrl}">${invitationUrl}</a></p>
            <p>This link will expire in 7 days.</p>
            <p>If you believe this is a mistake, please ignore this email.</p>
            <p>Best regards,<br>School Management System Team</p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Parent invitation email sent to ${parentEmail}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending parent invitation email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 