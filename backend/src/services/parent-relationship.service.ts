import { parentRelationshipModel, RelationshipStatus, RelationshipType, ParentRelationship } from '../models/parent-relationship.mysql';
import { sendEmail, loadEmailTemplate } from '../utils/email';
import { config } from '../config';
import { userModel } from '../models/user.model';
import { UserRole } from '../types/auth';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import bcrypt from 'bcrypt';

class ParentRelationshipService {
  /**
   * Create a parent-student relationship request
   */
  async createRelationshipRequest(
    parentId: string,
    studentId: string,
    relationshipType: RelationshipType,
    description: string
  ): Promise<ParentRelationship> {
    // Check if student exists
    const student = await userModel.findById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }
    
    // Check if student is actually a student
    if (student.role !== 'student') {
      throw new Error('The specified user is not a student');
    }
    
    // Create the relationship request
    const relationship = await parentRelationshipModel.create({
      parentId,
      studentId,
      relationshipType,
      description,
      status: RelationshipStatus.PENDING
    });
    
    // Send verification email
    const parentUser = await userModel.findById(parentId);
    if (parentUser && parentUser.email) {
      await this.sendVerificationEmail(
        parentUser.email, 
        relationship,
        `${student.firstName} ${student.lastName}`
      );
    }
    
    return relationship;
  }
  
  /**
   * Verify a parent-student relationship
   */
  async verifyRelationship(token: string): Promise<ParentRelationship | null> {
    // Check if token is valid
    const isValid = await parentRelationshipModel.isTokenValid(token);
    if (!isValid) {
      throw new Error('Invalid or expired verification token');
    }
    
    // Get relationship by token
    const relationship = await parentRelationshipModel.getByToken(token);
    if (!relationship) {
      throw new Error('Relationship not found');
    }
    
    // Update status to verified
    return parentRelationshipModel.updateStatus(relationship.id, RelationshipStatus.VERIFIED);
  }
  
  /**
   * Reject a parent-student relationship
   */
  async rejectRelationship(token: string): Promise<ParentRelationship | null> {
    // Check if token is valid
    const isValid = await parentRelationshipModel.isTokenValid(token);
    if (!isValid) {
      throw new Error('Invalid or expired verification token');
    }
    
    // Get relationship by token
    const relationship = await parentRelationshipModel.getByToken(token);
    if (!relationship) {
      throw new Error('Relationship not found');
    }
    
    // Update status to rejected
    return parentRelationshipModel.updateStatus(relationship.id, RelationshipStatus.REJECTED);
  }
  
  /**
   * Get relationship by verification token along with student details
   */
  async getRelationshipByToken(token: string): Promise<{
    relationship: ParentRelationship;
    student: any;
  } | null> {
    const relationship = await parentRelationshipModel.getByToken(token);
    if (!relationship) {
      return null;
    }
    
    const student = await userModel.findById(relationship.studentId);
    if (!student) {
      return null;
    }
    
    return { relationship, student };
  }
  
  /**
   * Get all verified children for a parent
   */
  async getChildren(parentId: string): Promise<any[]> {
    try {
      const results = await parentRelationshipModel.getByParentId(parentId, RelationshipStatus.VERIFIED);
      
      // Fetch additional student details as needed
      const children = await Promise.all(results.map(async (relationship) => {
        const student = await userModel.findById(relationship.studentId);
        if (!student) {
          return null;
        }
        return {
          relationshipId: relationship.id,
          relationshipType: relationship.relationshipType,
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            grade: (student as any).grade || null,
            profilePicture: (student as any).profilePicture || null
          }
        };
      }));
      
      // Filter out any null children (where student wasn't found)
      return children.filter(child => child !== null);
    } catch (error: any) {
      logger.error(`Error fetching children for parent ${parentId}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Check if a parent has a verified relationship with a student
   */
  async hasVerifiedRelationship(parentId: string, studentId: string): Promise<boolean> {
    const relationships = await parentRelationshipModel.getVerifiedChildren(parentId);
    return relationships.some(r => r.studentId === studentId);
  }
  
  /**
   * Resend verification email
   */
  async resendVerificationEmail(relationshipId: string): Promise<boolean> {
    try {
      const relationship = await parentRelationshipModel.getById(relationshipId);
      if (!relationship) {
        throw new Error('Relationship not found');
      }

      if (relationship.status === RelationshipStatus.VERIFIED) {
        throw new Error('Relationship already verified');
      }

      // Regenerate verification token
      const updatedToken = await parentRelationshipModel.updateVerificationToken(relationshipId);
      if (!updatedToken) {
        throw new Error('Failed to update verification token');
      }
      
      // Get parent and student information
      const [parent, student] = await Promise.all([
        userModel.findById(relationship.parentId as string),
        userModel.findById(relationship.studentId)
      ]);

      if (!parent || !student) {
        throw new Error('Parent or student user not found');
      }

      // Update the relationship with the new token
      const updatedRelationship = {
        ...relationship,
        verificationToken: updatedToken.token,
        tokenExpiry: updatedToken.expiry
      };

      // Send verification email
      await this.sendVerificationEmail(
        parent.email,
        updatedRelationship,
        `${student.firstName} ${student.lastName}`
      );

      return true;
    } catch (error) {
      logger.error(`Failed to resend verification email: ${error}`);
      throw error;
    }
  }
  
  /**
   * Send verification email to the parent
   */
  private async sendVerificationEmail(
    parentEmail: string, 
    relationship: ParentRelationship,
    studentName: string
  ): Promise<void> {
    try {
      // Create verification and rejection links
      const verificationLink = `${config.frontendUrl}/parent-verification?token=${relationship.verificationToken}`;
      const rejectLink = `${config.frontendUrl}/parent-verification?token=${relationship.verificationToken}&reject=true`;
      
      // Format parent name if available
      const parentName = relationship.parentFirstName 
        ? `${relationship.parentFirstName} ${relationship.parentLastName || ''}`
        : 'Parent/Guardian';
      
      // Load email template with replacements
      const currentYear = new Date().getFullYear();
      const emailHtml = loadEmailTemplate('verification', {
        parentName,
        studentName,
        verificationLink,
        rejectLink,
        currentYear: currentYear.toString()
      });
      
      // Send the email
      await sendEmail({
        to: parentEmail,
        subject: 'Verify Parent-Student Relationship',
        html: emailHtml
      });
      
      logger.info(`Verification email sent to: ${parentEmail}`);
    } catch (error: any) {
      logger.error(`Failed to send verification email: ${error.message}`, error);
      // Not throwing error to prevent transaction rollback due to email failure
    }
  }

  /**
   * Create a relationship request initiated by a student
   * @param studentId The ID of the student
   * @param parentEmail The email of the parent
   * @param parentFirstName Optional first name of the parent
   * @param parentLastName Optional last name of the parent
   * @param parentId Optional ID of existing parent (if parent already has an account)
   */
  async createStudentInitiatedRelationship(
    studentId: string,
    parentEmail: string,
    parentFirstName?: string,
    parentLastName?: string,
    parentId?: string | null
  ): Promise<any> {
    try {
      // Get student information
      const student = await userModel.findById(studentId);
      if (!student) {
        throw new Error('Student not found');
      }

      const status = parentId 
        ? RelationshipStatus.PENDING 
        : RelationshipStatus.PENDING_PARENT_REGISTRATION;
      
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // Token valid for 48 hours
      
      // Create relationship record
      const relationship = await parentRelationshipModel.create({
        studentId,
        parentId: parentId || null,
        status,
        relationshipType: RelationshipType.PARENT,
        description: '',
        verificationToken: token,
        tokenExpiresAt: expiresAt,
        parentEmail,
        parentFirstName,
        parentLastName
      });
      
      // Send verification email to parent
      const studentName = `${student.firstName} ${student.lastName}`;
      
      try {
        // Determine if we need to send a standard verification or a new account email
        if (parentId) {
          // Standard verification email for existing parent accounts
          const emailContent = `
            <h1>Student Verification Request</h1>
            <p>Hello${parentFirstName ? ' ' + parentFirstName : ''},</p>
            <p>${studentName} has added you as their parent/guardian in our school management system.</p>
            <p>Please click the link below to verify this relationship:</p>
            <p><a href="${config.frontendUrl}/parent-verification?token=${token}">Verify Relationship</a></p>
            <p>This link will expire in 48 hours.</p>
            <p>If you did not request this, please ignore this email or contact support.</p>
          `;
          
          await sendEmail({
            to: parentEmail,
            subject: 'Verify Your Relationship with Student',
            html: emailContent
          });
          
          logger.info(`Verification email sent to existing parent at ${parentEmail}`);
        } else {
          // New account email with temporary password for new parents
          const emailContent = `
            <h1>Welcome to Our School Management System</h1>
            <p>Hello${parentFirstName ? ' ' + parentFirstName : ''},</p>
            <p>${studentName} has added you as their parent/guardian in our school management system.</p>
            <p>You need to create an account to verify this relationship. Please click the link below to register and verify:</p>
            <p><a href="${config.frontendUrl}/parent-verification?token=${token}">Verify Relationship</a></p>
            <p>This link will expire in 48 hours.</p>
            <p>If you did not expect this, please ignore this email or contact support.</p>
          `;
          
          await sendEmail({
            to: parentEmail,
            subject: 'Your New Parent Account and Student Verification',
            html: emailContent
          });
          
          logger.info(`New parent account email with temporary password sent to ${parentEmail}`);
        }
      } catch (emailError) {
        // Log the error but don't fail the whole process
        logger.error(`Failed to send email to parent at ${parentEmail}: ${emailError}`);
        logger.warn('Continuing with parent relationship creation despite email failure');
      }
      
      return relationship;
    } catch (error: any) {
      logger.error(`Error creating student-initiated relationship: ${error.message}`);
      throw error;
    }
  }

  async getPendingRelationships(parentId: string): Promise<any[]> {
    try {
      // Fetch relationships where the parent email matches the user's email
      const parentUser = await userModel.findById(parentId);
      if (!parentUser) {
        throw new Error('Parent user not found');
      }

      // First get direct pending relationships where parentId is set
      const pendingByParentId = await parentRelationshipModel.getByParentId(
        parentId, 
        RelationshipStatus.PENDING
      );
      
      // Then get relationships where parentEmail matches user's email
      // (these are student-initiated relationships)
      const pendingByEmail = await parentRelationshipModel.getByParentEmail(
        parentUser.email,
        RelationshipStatus.PENDING_PARENT_REGISTRATION
      );
      
      // Combine and format results
      const allPendingRelationships = [...pendingByParentId, ...pendingByEmail];
      
      const formattedRelationships = await Promise.all(
        allPendingRelationships.map(async (relationship) => {
          const student = await userModel.findById(relationship.studentId);
          if (!student) {
            return null;
          }
          
          return {
            id: relationship.id,
            studentId: student.id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail: student.email,
            relationshipType: relationship.relationshipType,
            createdAt: relationship.createdAt,
            status: relationship.status
          };
        })
      );
      
      // Filter out any null relationships (where student wasn't found)
      return formattedRelationships.filter(rel => rel !== null);
    } catch (error: any) {
      logger.error(`Error fetching pending relationships for parent ${parentId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a relationship request initiated by a student using a database connection (for transactions)
   */
  async createStudentInitiatedRelationshipWithConnection(
    connection: any,
    studentId: string,
    parentEmail: string,
    parentFirstName?: string,
    parentLastName?: string,
    parentId?: string | null
  ): Promise<any> {
    try {
      // Log detailed information for debugging
      logger.info(`Creating student-initiated relationship: studentId=${studentId}, parentEmail=${parentEmail}`);
      
      // Get student information first
      const [studentRows] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [studentId]
      );
      
      if (!studentRows || studentRows.length === 0) {
        throw new Error(`Student not found with ID: ${studentId}`);
      }
      
      const student = studentRows[0];
      logger.info(`Found student: ${student.firstName} ${student.lastName} (${student.email})`);

      // Check if parent already exists
      let existingParent = null;
      let parentUserId: string | null = parentId || null;
      let tempPassword = '';
      
      try {
        const [parentRows] = await connection.query(
          'SELECT * FROM users WHERE email = ?',
          [parentEmail]
        );
        
        if (parentRows && parentRows.length > 0) {
          existingParent = parentRows[0];
          logger.info(`Found existing parent with email ${parentEmail}, ID=${existingParent.id}`);
          parentUserId = existingParent.id;
        } else {
          logger.info(`No existing parent found with email ${parentEmail}, will create new account`);
        }
      } catch (error) {
        logger.warn(`Error checking for existing parent: ${error}`);
        // Continue with the process even if this check fails
      }
      
      // If parent doesn't exist, create a temporary parent account
      if (!existingParent) {
        try {
          logger.info(`Creating temporary parent account for ${parentEmail}`);
          
          // Generate a secure random temporary password
          tempPassword = crypto.randomBytes(12).toString('hex');
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          
          // Create the parent user account
          const id = crypto.randomUUID();
          logger.info(`Generated new parent ID: ${id}`);
          
          const createParentQuery = `
            INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;
          
          await connection.query(createParentQuery, [
            id,
            parentEmail,
            hashedPassword,
            parentFirstName || 'Parent',
            parentLastName || 'User',
            'parent'
          ]);
          
          parentUserId = id;
          logger.info(`Created temporary parent account with ID ${parentUserId}`);
        } catch (error) {
          logger.error(`Error creating parent account: ${error}`);
          throw new Error(`Failed to create parent account: ${error}`);
        }
      }

      const status = RelationshipStatus.PENDING;
      
      // Generate verification token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // Token valid for 48 hours
      
      logger.info(`Creating relationship record between student ${studentId} and parent ${parentUserId}`);
      
      // Create relationship record using the provided connection
      const createRelationshipQuery = `
        INSERT INTO parent_relationships (
          id, student_id, parent_id, status, relationship_type, 
          description, verification_token, token_expiry, 
          parent_email, parent_first_name, parent_last_name, created_at, updated_at
        )
        VALUES (
          ?, ?, ?, ?, ?, 
          ?, ?, ?, 
          ?, ?, ?, NOW(), NOW()
        )
      `;
      
      const relationshipId = crypto.randomUUID();
      await connection.query(createRelationshipQuery, [
        relationshipId,
        studentId,
        parentUserId,
        status,
        RelationshipType.PARENT,
        '',
        token,
        expiresAt,
        parentEmail,
        parentFirstName,
        parentLastName
      ]);
      
      logger.info(`Parent-student relationship created with ID ${relationshipId}`);
      
      // Send verification email to parent
      const studentName = `${student.firstName} ${student.lastName}`;
      
      try {
        // Determine if we need to send a standard verification or a new account email
        if (existingParent) {
          // Standard verification email for existing parent accounts
          const emailContent = `
            <h1>Student Verification Request</h1>
            <p>Hello${parentFirstName ? ' ' + parentFirstName : ''},</p>
            <p>${studentName} has added you as their parent/guardian in our school management system.</p>
            <p>Please click the link below to verify this relationship:</p>
            <p><a href="${config.frontendUrl}/parent-verification?token=${token}">Verify Relationship</a></p>
            <p>This link will expire in 48 hours.</p>
            <p>If you did not request this, please ignore this email or contact support.</p>
          `;
          
          await sendEmail({
            to: parentEmail,
            subject: 'Verify Your Relationship with Student',
            html: emailContent
          });
          
          logger.info(`Verification email sent to existing parent at ${parentEmail}`);
        } else {
          // New account email with temporary password for new parents
          const emailContent = `
            <h1>Welcome to Our School Management System</h1>
            <p>Hello${parentFirstName ? ' ' + parentFirstName : ''},</p>
            <p>${studentName} has added you as their parent/guardian in our school management system.</p>
            <p>We've created a parent account for you. Here are your login details:</p>
            <p><strong>Email:</strong> ${parentEmail}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            <p>Please <a href="${config.frontendUrl}/auth/sign-in">login here</a> and change your password as soon as possible.</p>
            <p>After logging in, you can verify your relationship with ${studentName} by clicking this link:</p>
            <p><a href="${config.frontendUrl}/parent-verification?token=${token}">Verify Relationship</a></p>
            <p>This verification link will expire in 48 hours.</p>
            <p>If you did not expect this, please ignore this email or contact support.</p>
          `;
          
          await sendEmail({
            to: parentEmail,
            subject: 'Your New Parent Account and Student Verification',
            html: emailContent
          });
          
          logger.info(`New parent account email with temporary password sent to ${parentEmail}`);
        }
      } catch (emailError) {
        // Log the error but don't fail the whole process
        logger.error(`Failed to send email to parent at ${parentEmail}: ${emailError}`);
        logger.warn('Continuing with parent relationship creation despite email failure');
      }
      
      return {
        id: relationshipId,
        studentId,
        parentId: parentUserId,
        status,
        relationshipType: RelationshipType.PARENT,
        verificationToken: token,
        tokenExpiry: expiresAt,
        parentEmail,
        parentFirstName,
        parentLastName
      };
    } catch (error: any) {
      logger.error(`Error creating student-initiated relationship with connection: ${error.message}`);
      throw error;
    }
  }
}

export const parentRelationshipService = new ParentRelationshipService(); 