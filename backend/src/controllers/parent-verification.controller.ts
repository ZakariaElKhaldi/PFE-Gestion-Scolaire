import { Request, Response } from 'express';
import { parentRelationshipService } from '../services/parent-relationship.service';
import { userModel } from '../models/user.model';
import { RelationshipType } from '../models/parent-relationship.mysql';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

class ParentVerificationController {
  /**
   * Create a parent-student relationship request
   * This can be called either by authenticated parents or during parent registration
   */
  async createRelationshipRequest(req: Request, res: Response): Promise<Response> {
    try {
      // Handle two different request formats:
      // 1. From authenticated parent: {studentId, relationshipType, description}
      // 2. During registration: {parentEmail, studentEmail, relationType}
      
      if (req.body.parentEmail && req.body.studentEmail) {
        // Case 2: Parent registration flow
        const { parentEmail, studentEmail, relationType = 'parent' } = req.body;
        
        // Validation
        if (!parentEmail || !studentEmail) {
          return res.status(400).json({
            error: true,
            message: 'Parent email and student email are required'
          });
        }
        
        // Check if student exists
        const student = await userModel.findByEmail(studentEmail);
        if (!student || student.role !== 'student') {
          return res.status(404).json({
            error: true,
            message: 'Student not found or the email does not belong to a student account'
          });
        }
        
        // Check if parent exists
        const parent = await userModel.findByEmail(parentEmail);
        if (!parent || parent.role !== 'parent') {
          return res.status(404).json({
            error: true,
            message: 'Parent not found or the email does not belong to a parent account'
          });
        }
        
        // Create the relationship
        const relationshipData = await parentRelationshipService.createRelationshipRequest(
          parent.id,
          student.id,
          relationType as RelationshipType,
          ''  // No description needed
        );
        
        return res.status(201).json({
          error: false,
          message: 'Relationship request created and verification email sent',
          data: {
            relationshipId: relationshipData.id,
            status: 'pending'
          }
        });
      } else {
        // Case 1: Authenticated parent flow
        const { studentId, relationshipType, description } = req.body;
        
        // Validation
        if (!studentId) {
          return res.status(400).json({
            error: true,
            message: 'Student ID is required'
          });
        }
        
        if (!Object.values(RelationshipType).includes(relationshipType as RelationshipType)) {
          return res.status(400).json({
            error: true,
            message: 'Invalid relationship type'
          });
        }
        
        // Get parent ID from authenticated user
        const parentId = req.user?.id;
        if (!parentId) {
          return res.status(401).json({
            error: true,
            message: 'Authentication required'
          });
        }
        
        // Create relationship
        const relationship = await parentRelationshipService.createRelationshipRequest(
          parentId,
          studentId,
          relationshipType as RelationshipType,
          description || ''
        );
        
        return res.status(201).json({
          error: false,
          message: 'Relationship request created',
          data: relationship
        });
      }
    } catch (error: any) {
      console.error('Error creating relationship request:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to create relationship request'
      });
    }
  }
  
  /**
   * Get relationship details by token
   */
  async getRelationshipByToken(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          error: true,
          message: 'Token is required'
        });
      }
      
      const relationshipData = await parentRelationshipService.getRelationshipByToken(token);
      
      if (!relationshipData) {
        return res.status(404).json({
          error: true,
          message: 'Relationship not found or token is invalid'
        });
      }
      
      return res.status(200).json({
        error: false,
        data: relationshipData
      });
    } catch (error: any) {
      console.error('Error getting relationship:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to get relationship'
      });
    }
  }
  
  /**
   * Verify relationship
   */
  async verifyRelationship(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          error: true,
          message: 'Token is required'
        });
      }
      
      const relationship = await parentRelationshipService.verifyRelationship(token);
      
      return res.status(200).json({
        error: false,
        message: 'Relationship verified successfully',
        data: relationship
      });
    } catch (error: any) {
      console.error('Error verifying relationship:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to verify relationship'
      });
    }
  }
  
  /**
   * Reject relationship
   */
  async rejectRelationship(req: Request, res: Response): Promise<Response> {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          error: true,
          message: 'Token is required'
        });
      }
      
      const relationship = await parentRelationshipService.rejectRelationship(token);
      
      return res.status(200).json({
        error: false,
        message: 'Relationship rejected successfully',
        data: relationship
      });
    } catch (error: any) {
      console.error('Error rejecting relationship:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to reject relationship'
      });
    }
  }
  
  /**
   * Register as parent and verify relationship in one step
   */
  async registerAndVerify(req: Request, res: Response): Promise<Response> {
    try {
      const { token, email, password, firstName, lastName, phoneNumber } = req.body;
      
      // Validation
      if (!token || !email || !password || !firstName || !lastName) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields'
        });
      }
      
      // Check if email already exists
      const existingUser = await userModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: true,
          message: 'Email is already registered'
        });
      }
      
      // Get relationship details
      const relationshipData = await parentRelationshipService.getRelationshipByToken(token);
      if (!relationshipData) {
        return res.status(404).json({
          error: true,
          message: 'Relationship not found or token is invalid'
        });
      }
      
      // Create parent account
      const parentId = await userModel.create({
        email,
        password,  // The model will hash this
        firstName,
        lastName,
        role: 'parent',
        phoneNumber
      });
      
      // Verify the relationship
      const verifiedRelationship = await parentRelationshipService.verifyRelationship(token);
      
      // Get newly created parent for response
      const newParent = await userModel.findById(parentId);
      
      return res.status(201).json({
        error: false,
        message: 'Parent account created and relationship verified',
        data: {
          user: {
            id: parentId,
            email,
            firstName,
            lastName,
            role: 'parent'
          },
          relationship: verifiedRelationship
        }
      });
    } catch (error: any) {
      console.error('Error registering parent and verifying relationship:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to register and verify'
      });
    }
  }
  
  /**
   * Get children for a parent
   */
  async getChildren(req: Request, res: Response): Promise<Response> {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      const children = await parentRelationshipService.getChildren(parentId);
      
      return res.status(200).json({
        error: false,
        data: children
      });
    } catch (error: any) {
      console.error('Error getting children:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to get children'
      });
    }
  }
  
  /**
   * Resend verification email
   */
  async resendVerificationEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { relationshipId } = req.params;
      const parentId = req.user?.id;
      
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      if (!relationshipId) {
        return res.status(400).json({
          error: true,
          message: 'Relationship ID is required'
        });
      }
      
      await parentRelationshipService.resendVerificationEmail(relationshipId);
      
      return res.status(200).json({
        error: false,
        message: 'Verification email resent successfully'
      });
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to resend verification email'
      });
    }
  }
  
  /**
   * Create a relationship request initiated by a student
   * This is called when a student registers and provides parent info
   */
  async createStudentInitiatedRelationship(req: Request, res: Response): Promise<Response> {
    try {
      const { studentId, parentEmail, parentFirstName, parentLastName } = req.body;
      
      // Validation
      if (!studentId || !parentEmail) {
        return res.status(400).json({
          error: true,
          message: 'Student ID and parent email are required'
        });
      }
      
      // Check if student exists
      const student = await userModel.findById(studentId);
      if (!student || student.role !== 'student') {
        return res.status(404).json({
          error: true,
          message: 'Student not found or invalid ID'
        });
      }
      
      // Check if parent already exists
      const existingParent = await userModel.findByEmail(parentEmail);
      let parentId: string;
      
      if (existingParent) {
        // Parent already exists, use their ID
        if (existingParent.role !== 'parent') {
          return res.status(400).json({
            error: true,
            message: 'Email is registered to a non-parent account'
          });
        }
        parentId = existingParent.id;
      } else {
        // Parent doesn't exist, we'll create the relationship with pending parent registration
        // The parent record will be created when they verify the relationship
        parentId = ''; // This will be updated when the parent registers
      }
      
      // Create the relationship with a special status
      const relationshipData = await parentRelationshipService.createStudentInitiatedRelationship(
        studentId,
        parentEmail,
        parentFirstName,
        parentLastName,
        parentId || null
      );
      
      return res.status(201).json({
        error: false,
        message: 'Parent verification request sent',
        data: {
          relationshipId: relationshipData.id,
          status: 'pending_parent_action',
          parentExists: !!existingParent
        }
      });
    } catch (error: any) {
      console.error('Error creating student-initiated relationship:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to create relationship request'
      });
    }
  }

  async getPendingRelationships(req: Request, res: Response): Promise<Response> {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required'
        });
      }
      
      const pendingRelationships = await parentRelationshipService.getPendingRelationships(parentId);
      
      return res.status(200).json({
        error: false,
        data: pendingRelationships
      });
    } catch (error: any) {
      console.error('Error getting pending relationships:', error);
      return res.status(500).json({
        error: true,
        message: error.message || 'Failed to get pending relationships'
      });
    }
  }
}

export const parentVerificationController = new ParentVerificationController(); 