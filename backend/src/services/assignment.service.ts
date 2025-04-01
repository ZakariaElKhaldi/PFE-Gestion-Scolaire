import { assignmentModel, Assignment } from '../models/assignment.model';
import { submissionModel, Submission, CreateSubmissionDTO as ModelCreateSubmissionDTO } from '../models/submission.model';
import { courseModel } from '../models/course.model';
import { userModel } from '../models/user.model';
import { courseEnrollmentModel } from '../models/course-enrollment.model';
import { SubmissionModel } from '../models/submission.model';

export interface AssignmentFilters {
  courseId?: string;
  status?: 'draft' | 'published' | 'closed';
  title?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
}

// Interface for creating an assignment
export interface CreateAssignmentData {
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  points: number;
  status: 'draft' | 'published' | 'closed';
}

// Interface for updating an assignment
export interface UpdateAssignmentData extends Partial<Omit<CreateAssignmentData, 'status'>> {
  status?: 'draft' | 'published' | 'closed';
}

// Interface for creating a submission
export interface CreateSubmissionData {
  assignmentId: string;
  studentId: string;
  content?: string;
  submissionUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  status?: 'submitted' | 'graded' | 'late';
}

// Define CreateSubmissionDTO to match what's being used in the model
export type CreateSubmissionDTO = ModelCreateSubmissionDTO;

// Interface for grading a submission
export interface GradeSubmissionData {
  grade: number;
  feedback?: string;
}

// Extended assignment with course details and submission stats
export interface AssignmentWithDetails extends Assignment {
  course?: {
    id: string;
    name: string;
    code: string;
  };
  stats?: {
    submissionCount: number;
    gradedCount: number;
    averageGrade: number | null;
  };
}

// Extended submission with student and assignment details
export interface SubmissionWithDetails extends Submission {
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignment?: {
    title: string;
    dueDate: Date;
    points: number;
    courseId: string;
    courseName?: string;
  };
}

class AssignmentService {
  /**
   * Get all assignments with optional filters
   */
  async getAssignments(filters?: AssignmentFilters): Promise<AssignmentWithDetails[]> {
    // Get assignments with filters
    const assignments = await assignmentModel.findAll(filters);
    
    // Enhance assignments with course details and stats
    const enhancedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await courseModel.findById(assignment.courseId);
        
        // Get submission stats - handle database errors gracefully
        let submissionCount = 0;
        let gradedCount = 0;
        let averageGrade = null;
        
        try {
          submissionCount = await submissionModel.countByAssignment(assignment.id);
          gradedCount = await submissionModel.countByAssignment(assignment.id, 'graded');
          averageGrade = await submissionModel.getAverageGradeForAssignment(assignment.id);
        } catch (error) {
          console.warn(`Error getting submission stats for assignment ${assignment.id}:`, error);
          // Continue with default values if an error occurs
        }
        
        return {
          ...assignment,
          course: course ? {
            id: course.id,
            name: course.name,
            code: course.code
          } : undefined,
          stats: {
            submissionCount,
            gradedCount,
            averageGrade
          }
        };
      })
    );
    
    return enhancedAssignments;
  }

  /**
   * Get a single assignment by ID with details
   */
  async getAssignment(id: string): Promise<AssignmentWithDetails | null> {
    const assignment = await assignmentModel.findById(id);
    
    if (!assignment) return null;
    
    // Get course details
    const course = await courseModel.findById(assignment.courseId);
    
    // Get submission stats
    const submissionCount = await submissionModel.countByAssignment(id);
    const gradedCount = await submissionModel.countByAssignment(id, 'graded');
    const averageGrade = await submissionModel.getAverageGradeForAssignment(id);
    
    return {
      ...assignment,
      course: course ? {
        id: course.id,
        name: course.name,
        code: course.code
      } : undefined,
      stats: {
        submissionCount,
        gradedCount,
        averageGrade
      }
    };
  }

  /**
   * Create a new assignment
   */
  async createAssignment(assignmentData: CreateAssignmentData, teacherId: string): Promise<Assignment> {
    // Check if course exists
    const course = await courseModel.findById(assignmentData.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to create assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to create assignments for this course');
      }
    }
    
    // Create assignment
    const assignmentId = await assignmentModel.create(assignmentData);
    
    // Get created assignment
    const assignment = await assignmentModel.findById(assignmentId);
    
    if (!assignment) {
      throw new Error('Failed to create assignment');
    }
    
    return assignment;
  }

  /**
   * Update an assignment
   */
  async updateAssignment(id: string, assignmentData: UpdateAssignmentData, teacherId: string): Promise<Assignment | null> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get the course to check permissions
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to update assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to update assignments for this course');
      }
    }
    
    // Update assignment
    const updated = await assignmentModel.update(id, assignmentData);
    
    if (!updated) {
      return null;
    }
    
    // Get updated assignment
    return assignmentModel.findById(id);
  }

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string, teacherId: string): Promise<boolean> {
    // Check if assignment exists
    const assignment = await assignmentModel.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Get the course to check permissions
    const course = await courseModel.findById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Verify that the teacher is associated with the course
    if (course.teacherId !== teacherId) {
      const user = await userModel.findById(teacherId);
      // Allow administrators to delete assignments for any course
      if (!user || (user.role !== 'administrator' && user.id !== course.teacherId)) {
        throw new Error('You are not authorized to delete assignments for this course');
      }
    }
    
    // Delete assignment
    return assignmentModel.delete(id);
  }

  /**
   * Get assignments for a course
   */
  async getAssignmentsForCourse(courseId: string): Promise<Assignment[]> {
    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Get assignments
    return assignmentModel.getByCourse(courseId);
  }

  /**
   * Get upcoming assignments for a student
   */
  async getUpcomingAssignmentsForStudent(studentId: string, limit: number = 5): Promise<Assignment[]> {
    // Check if student exists
    const student = await userModel.findById(studentId);
    if (!student || student.role !== 'student') {
      throw new Error('Student not found');
    }
    
    // Get upcoming assignments for the student
    return assignmentModel.getUpcomingForStudent(studentId, limit);
  }

  /**
   * Get recent assignments for a teacher
   */
  async getRecentAssignmentsForTeacher(teacherId: string, limit: number = 10): Promise<Assignment[]> {
    // Check if teacher exists
    const teacher = await userModel.findById(teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    
    // Check if teacher role is correct
    if (teacher.role !== 'teacher' && teacher.role !== 'administrator') {
      throw new Error('User must be a teacher or administrator');
    }
    
    // Get recent assignments
    return assignmentModel.getRecentForTeacher(teacherId, limit);
  }

  /**
   * Submit an assignment
   */
  async submitAssignment(submissionData: CreateSubmissionData): Promise<Submission> {
    try {
      console.log('Assignment service submitting assignment with data:', JSON.stringify(submissionData, null, 2));
      
      const now = new Date();
      
      // Validate required fields
      if (!submissionData.assignmentId) {
        throw new Error('Assignment ID is required');
      }
      
      if (!submissionData.studentId) {
        throw new Error('Student ID is required');
      }
      
      // Check if assignment exists first
      try {
        const assignment = await assignmentModel.findById(submissionData.assignmentId);
        if (!assignment) {
          throw new Error(`Assignment not found with ID: ${submissionData.assignmentId}`);
        }
        console.log('Found assignment:', JSON.stringify(assignment, null, 2));
      } catch (err: unknown) {
        console.error('Error checking assignment:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        throw new Error(`Failed to verify assignment: ${errorMessage}`);
      }
      
      // Create a simplified submission object with minimal fields
      const createData = {
        assignmentId: submissionData.assignmentId,
        studentId: submissionData.studentId,
        feedback: submissionData.content || '',
        status: 'submitted' as const
      };
      
      console.log('Attempting to create submission with data:', JSON.stringify(createData, null, 2));
      
      // Create submission directly using SQL to bypass potential model issues
      try {
        // Generate a UUID for the submission
        const id = require('uuid').v4();
        const query = `
          INSERT INTO assignment_submissions 
          (id, assignmentId, studentId, feedback, status, submittedAt, submissionUrl)
          VALUES (?, ?, ?, ?, ?, NOW(), ?)
        `;
        
        const values = [
          id,
          createData.assignmentId,
          createData.studentId,
          createData.feedback,
          createData.status,
          submissionData.submissionUrl || null
        ];
        
        console.log('Executing SQL query:', query);
        console.log('With values:', values);
        
        const [result] = await require('../config/db').pool.query(query, values);
        console.log('Query result:', result);
        
        // Return a constructed submission object with type assertions
        return {
          id,
          assignmentId: createData.assignmentId,
          studentId: createData.studentId,
          submissionText: createData.feedback,
          feedback: createData.feedback,
          status: createData.status,
          submissionDate: now,
          submittedAt: now,
          submissionUrl: submissionData.submissionUrl
        } as unknown as Submission;
      } catch (dbError: unknown) {
        console.error('Database error creating submission:', dbError);
        const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
        throw new Error(`Database error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error in assignment service submitAssignment:', error);
      throw error;
    }
  }

  /**
   * Get submission with details (student and assignment info)
   */
  async getSubmissionWithDetails(submissionId: string): Promise<SubmissionWithDetails | null> {
    const submission = await submissionModel.findById(submissionId);
    
    if (!submission) {
      return null;
    }
    
    // Get student details
    const student = await userModel.findById(submission.studentId);
    
    // Get assignment details
    const assignment = await assignmentModel.findById(submission.assignmentId);
    if (!assignment) {
      return null;
    }
    
    // Get course details
    const course = await courseModel.findById(assignment.courseId);
    
    return {
      ...submission,
      student: student ? {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email
      } : undefined,
      assignment: {
        title: assignment.title,
        dueDate: assignment.dueDate,
        points: assignment.points,
        courseId: assignment.courseId,
        courseName: course ? course.name : 'Unknown Course'
      }
    };
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    submissionId: string, 
    gradeData: GradeSubmissionData, 
    teacherId: string
  ): Promise<SubmissionWithDetails | null> {
    // Find submission
    const submission = await submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error('Submission not found');
    }
    
    // Find assignment to check points
    const assignment = await assignmentModel.findById(submission.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    
    // Validate grade is within range
    if (gradeData.grade < 0 || gradeData.grade > assignment.points) {
      throw new Error(`Grade must be between 0 and ${assignment.points} points`);
    }
    
    // Update submission with grade
    await submissionModel.update(submissionId, {
      grade: gradeData.grade,
      feedback: gradeData.feedback || '',
      status: 'graded'
    });
    
    // Get updated submission with details
    const updatedSubmission = await this.getSubmissionWithDetails(submissionId);
    return updatedSubmission;
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissionsForAssignment(assignmentId: string): Promise<SubmissionWithDetails[]> {
    // Use getByAssignment method from the model
    const submissions = await submissionModel.getByAssignment(assignmentId);
    
    const assignment = await assignmentModel.findById(assignmentId);
    
    if (!assignment) {
      return [];
    }
    
    // Get course info
    const course = await courseModel.findById(assignment.courseId);
    
    // Add student and assignment info to submissions
    const detailedSubmissions = await Promise.all(submissions.map(async (submission: Submission) => {
      const student = await userModel.findById(submission.studentId);
      
      return {
        ...submission,
        student: student ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email
        } : undefined,
        assignment: {
          title: assignment.title,
          dueDate: assignment.dueDate,
          points: assignment.points,
          courseId: assignment.courseId,
          courseName: course ? course.name : 'Unknown Course'
        }
      };
    }));
    
    return detailedSubmissions;
  }

  /**
   * Get submissions for a student
   */
  async getSubmissionsForStudent(studentId: string): Promise<SubmissionWithDetails[]> {
    // Use getByStudent method from the model
    const submissions = await submissionModel.getByStudent(studentId);
    
    // Add assignment and course info to submissions
    const detailedSubmissions = await Promise.all(submissions.map(async (submission: Submission) => {
      const assignment = await assignmentModel.findById(submission.assignmentId);
      if (!assignment) {
        return null;
      }
      
      const course = await courseModel.findById(assignment.courseId);
      
      return {
        ...submission,
        assignment: {
          title: assignment.title,
          dueDate: assignment.dueDate,
          points: assignment.points,
          courseId: assignment.courseId,
          courseName: course ? course.name : 'Unknown Course'
        }
      };
    }));
    
    // Filter out null submissions (where assignment was not found)
    return detailedSubmissions.filter((s: SubmissionWithDetails | null) => s !== null) as SubmissionWithDetails[];
  }
}

export const assignmentService = new AssignmentService(); 