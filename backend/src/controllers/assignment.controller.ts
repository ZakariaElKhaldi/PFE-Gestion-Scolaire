import { Request, Response } from 'express';
import { assignmentService, AssignmentFilters, CreateAssignmentData, UpdateAssignmentData, CreateSubmissionData, GradeSubmissionData } from '../services/assignment.service';
import { 
  saveFile, 
  isFileTypeAllowed, 
  isFileSizeAllowed, 
  streamFileToResponse, 
  FileInfo,
  uploadDir 
} from '../utils/file-utils';
import * as path from 'path';
import * as fs from 'fs';
import { submissionModel } from '../models/submission.model';
import { JwtPayload } from '../types/auth';

class AssignmentController {
  /**
   * Get all assignments
   */
  async getAssignments(req: Request, res: Response) {
    try {
      const filters: AssignmentFilters = {
        courseId: req.query.courseId as string,
        status: req.query.status as any,
        title: req.query.title as string,
        dueDate: req.query.dueDate as string,
        dueBefore: req.query.dueBefore as string,
        dueAfter: req.query.dueAfter as string,
      };
      
      const assignments = await assignmentService.getAssignments(filters);
      
      res.status(200).json({
        error: false,
        data: { assignments },
        message: 'Assignments retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve assignments',
      });
    }
  }

  /**
   * Get a single assignment
   */
  async getAssignment(req: Request, res: Response) {
    try {
      const assignmentId = req.params.id;
      
      const assignment = await assignmentService.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({
          error: true,
          message: 'Assignment not found',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { assignment },
        message: 'Assignment retrieved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve assignment',
      });
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const assignmentData: CreateAssignmentData = req.body;
      
      const assignment = await assignmentService.createAssignment(
        assignmentData,
        req.user.userId
      );
      
      res.status(201).json({
        error: false,
        data: { assignment },
        message: 'Assignment created successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to create assignment',
      });
    }
  }

  /**
   * Update an assignment
   */
  async updateAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const assignmentId = req.params.id;
      const assignmentData: UpdateAssignmentData = req.body;
      
      const assignment = await assignmentService.updateAssignment(
        assignmentId,
        assignmentData,
        req.user.userId
      );
      
      if (!assignment) {
        return res.status(404).json({
          error: true,
          message: 'Assignment not found or could not be updated',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { assignment },
        message: 'Assignment updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to update assignment',
      });
    }
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const assignmentId = req.params.id;
      
      const deleted = await assignmentService.deleteAssignment(
        assignmentId,
        req.user.userId
      );
      
      if (!deleted) {
        return res.status(404).json({
          error: true,
          message: 'Assignment not found or could not be deleted',
        });
      }
      
      res.status(200).json({
        error: false,
        message: 'Assignment deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to delete assignment',
      });
    }
  }

  /**
   * Get assignments for a course
   */
  async getAssignmentsForCourse(req: Request, res: Response) {
    try {
      const courseId = req.params.courseId;
      
      const assignments = await assignmentService.getAssignmentsForCourse(courseId);
      
      res.status(200).json({
        error: false,
        data: { assignments },
        message: 'Course assignments retrieved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to retrieve course assignments',
      });
    }
  }

  /**
   * Get upcoming assignments for current student
   */
  async getUpcomingAssignments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const assignments = await assignmentService.getUpcomingAssignmentsForStudent(
        req.user.userId,
        limit
      );
      
      res.status(200).json({
        error: false,
        data: { assignments },
        message: 'Upcoming assignments retrieved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to retrieve upcoming assignments',
      });
    }
  }

  /**
   * Get recent assignments for current teacher
   */
  async getRecentAssignments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const assignments = await assignmentService.getRecentAssignmentsForTeacher(
        req.user.userId,
        limit
      );
      
      res.status(200).json({
        error: false,
        data: { assignments },
        message: 'Recent assignments retrieved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to retrieve recent assignments',
      });
    }
  }

  /**
   * Submit an assignment
   */
  async submitAssignment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const assignmentId = req.params.assignmentId;
      
      // Check if there's a file attached
      if (!req.file) {
        return res.status(400).json({
          error: true,
          message: 'No file uploaded for submission',
        });
      }

      // Validate file type
      if (!isFileTypeAllowed(req.file.mimetype)) {
        return res.status(400).json({
          error: true,
          message: 'File type not allowed',
        });
      }

      // Validate file size
      if (!isFileSizeAllowed(req.file.size)) {
        return res.status(400).json({
          error: true,
          message: 'File size exceeds limit',
        });
      }

      // Save file to disk using enhanced utilities
      const fileInfo: FileInfo = saveFile(
        req.file.buffer, 
        req.file.originalname, 
        'assignment'
      );

      // Create submission with file URL
      const submissionData: CreateSubmissionData = {
        assignmentId,
        studentId: req.user.userId,
        submissionUrl: fileInfo.url,
        fileName: fileInfo.originalName,
        fileType: fileInfo.type,
        fileSize: fileInfo.size
      };
      
      const submission = await assignmentService.submitAssignment(submissionData);
      
      res.status(201).json({
        error: false,
        data: { submission },
        message: 'Assignment submitted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to submit assignment',
      });
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const submissionId = req.params.submissionId;
      const gradeData: GradeSubmissionData = req.body;
      
      const submission = await assignmentService.gradeSubmission(
        submissionId,
        gradeData,
        req.user.userId
      );
      
      if (!submission) {
        return res.status(404).json({
          error: true,
          message: 'Submission not found or could not be graded',
        });
      }
      
      res.status(200).json({
        error: false,
        data: { submission },
        message: 'Submission graded successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to grade submission',
      });
    }
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissionsForAssignment(req: Request, res: Response) {
    try {
      const assignmentId = req.params.assignmentId;
      
      const submissions = await assignmentService.getSubmissionsForAssignment(assignmentId);
      
      res.status(200).json({
        error: false,
        data: { submissions },
        message: 'Assignment submissions retrieved successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: true,
        message: error.message || 'Failed to retrieve assignment submissions',
      });
    }
  }

  /**
   * Get submissions for current student
   */
  async getMySubmissions(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      try {
        const submissions = await assignmentService.getSubmissionsForStudent(req.user.userId);
        
        res.status(200).json({
          error: false,
          data: { submissions },
          message: 'Your submissions retrieved successfully',
        });
      } catch (serviceError) {
        console.error('Error retrieving submissions:', serviceError);
        // Return empty submissions array instead of an error
        res.status(200).json({
          error: false,
          data: { submissions: [] },
          message: 'No submissions found or database error occurred',
        });
      }
    } catch (error: any) {
      console.error('Controller error in getMySubmissions:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to retrieve your submissions',
      });
    }
  }

  /**
   * Download a submission file
   */
  async downloadSubmissionFile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: true,
          message: 'Authentication required',
        });
      }
      
      const submissionId = req.params.submissionId;
      
      // Get the submission
      const submission = await submissionModel.findById(submissionId);
      
      if (!submission) {
        return res.status(404).json({
          error: true,
          message: 'Submission not found',
        });
      }
      
      // Check user permissions
      if (req.user.role !== 'admin' && req.user.role !== 'teacher' && submission.studentId !== req.user.userId) {
        return res.status(403).json({
          error: true,
          message: 'You do not have permission to access this file',
        });
      }
      
      // Get file path from submission URL
      const filePath = path.join(uploadDir, 'assignments', path.basename(submission.submissionUrl || ''));
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: true,
          message: 'File not found',
        });
      }
      
      // Stream the file to response
      streamFileToResponse(filePath, res, submission.fileName);
    } catch (error: any) {
      res.status(500).json({
        error: true,
        message: error.message || 'Failed to download submission file',
      });
    }
  }
}

export const assignmentController = new AssignmentController(); 